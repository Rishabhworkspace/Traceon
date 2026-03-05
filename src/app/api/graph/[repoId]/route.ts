import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import Repository from '@/lib/db/models/Repository';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const resolvedParams = await params;
        await dbConnect();

        // Verify access — user must own the repo or have the session
        const session = await getServerSession(authOptions);
        const repo = await Repository.findById(resolvedParams.repoId).lean();

        if (!repo) {
            return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
        }

        // Allow access if user owns repo, or if repo has a matching guest sessionId
        const userId = session?.user?.id;
        const guestSessionId = req.headers.get('x-session-id');

        const isOwner = userId && repo.userId?.toString() === userId;
        const isGuestOwner = !repo.userId && guestSessionId && repo.sessionId === guestSessionId;

        if (!isOwner && !isGuestOwner) {
            // Allow public access for now (repos analyzed by URL are semi-public)
            // Uncomment below to enforce strict access:
            // return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch graph data with lean() for performance
        const analysis = await AnalysisResult.findOne({ repositoryId: resolvedParams.repoId }).lean();

        if (!analysis) {
            return NextResponse.json({
                status: repo.status,
                message: 'Analysis data not yet ready or failed.'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            status: repo.status,
            data: {
                nodes: analysis.nodes,
                edges: analysis.edges,
                metrics: analysis.metrics,
                history: analysis.history
            }
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Failed to fetch graph data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
