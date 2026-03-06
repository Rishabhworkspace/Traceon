import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import Repository from '@/lib/db/models/Repository';
import { generateArchitectureSummary } from '@/lib/analyzer/graph/summarize';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const resolvedParams = await params;
        await dbConnect();

        const repo = await Repository.findById(resolvedParams.repoId).lean();
        if (!repo) {
            return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
        }

        const analysis = await AnalysisResult.findOne({ repositoryId: resolvedParams.repoId }).lean();
        if (!analysis) {
            return NextResponse.json({ message: 'Analysis data not found' }, { status: 404 });
        }

        const { nodes, edges, metrics } = analysis;
        const markdown = generateArchitectureSummary(nodes, edges, metrics, repo.name);

        return NextResponse.json({
            success: true,
            data: {
                markdown,
                repoName: repo.name,
            },
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Architecture summary failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
