import { NextResponse } from 'next/server';
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

        // Basic check if repo exists
        const repo = await Repository.findById(resolvedParams.repoId);
        if (!repo) {
            return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
        }

        // Fetch graph data
        const analysis = await AnalysisResult.findOne({ repositoryId: resolvedParams.repoId });

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
                metrics: analysis.metrics
            }
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Failed to fetch graph data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
