import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import { cloneRepository } from '@/lib/analyzer/clone';
import { runAnalysisPipeline } from '@/lib/analyzer/pipeline';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Allow up to 60s for Vercel Pro, 10s for free tier

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { repoUrl, sessionId: clientSessionId } = await req.json();

        if (!repoUrl || typeof repoUrl !== 'string') {
            return NextResponse.json({ message: 'Valid repository URL is required' }, { status: 400 });
        }

        // Basic GitHub URL validation
        const githubRegex = /^https:\/\/github\.com\/([\w-]+)\/([\w-.]+)(?:\.git)?$/;
        const match = repoUrl.match(githubRegex);

        if (!match) {
            return NextResponse.json({ message: 'Must be a valid GitHub repository URL' }, { status: 400 });
        }

        const owner = match[1];
        let name = match[2];
        if (name.endsWith('.git')) {
            name = name.slice(0, -4);
        }

        // Connect to database
        await dbConnect();

        // Generate or use existing sessionId for guest users
        const sessionId = session?.user?.id ? null : (clientSessionId || uuidv4());
        const userId = session?.user?.id || null;

        // Create the initial repository record
        const repository = await Repository.create({
            userId,
            repoUrl,
            name,
            owner,
            status: 'pending',
            sessionId,
        });

        const repoId = repository._id.toString();

        // Use next/server after() to run background work after response is sent
        // This keeps the serverless function alive on Vercel until the work completes
        after(async () => {
            await startAnalysis(repoId, repoUrl);
        });

        return NextResponse.json({
            success: true,
            repositoryId: repository._id,
            sessionId,
        }, { status: 202 });

    } catch (error: unknown) {
        console.error('Analyze trigger error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal server error', error: msg }, { status: 500 });
    }
}

async function startAnalysis(repoId: string, url: string) {
    let cleanupFunction: (() => Promise<void>) | null = null;
    try {
        // 1. Mark as cloning
        await dbConnect();
        await Repository.findByIdAndUpdate(repoId, { status: 'cloning' });

        // 2. Clone the repository
        const cloneResult = await cloneRepository(url);
        cleanupFunction = cloneResult.cleanup;
        const { repoPath } = cloneResult;

        // 3. Run the full pipeline
        await runAnalysisPipeline(repoId, repoPath, url, cleanupFunction);
    } catch (err: unknown) {
        console.error('Analysis failed:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        try {
            await dbConnect();
            await Repository.findByIdAndUpdate(repoId, {
                status: 'failed',
                errorMessage: msg
            });
        } catch (dbErr) {
            console.error('Failed to update repository status:', dbErr);
        }
        if (cleanupFunction) {
            await cleanupFunction();
        }
    }
}
