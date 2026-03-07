import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import Repository from '@/lib/db/models/Repository';
import { analyzeImpact, generateFullImpactReport } from '@/lib/analyzer/graph/impact';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { searchParams } = new URL(req.url);
        const nodeId = searchParams.get('nodeId'); // optional: analyze specific node
        const clientSessionId = searchParams.get('sessionId');

        await dbConnect();
        const session = await getServerSession(authOptions);

        const repo = await Repository.findById(resolvedParams.repoId).lean();
        if (!repo) {
            return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
        }

        const isAuthenticatedRow = repo.userId?.toString() === session?.user?.id;
        const isGuestRow = repo.sessionId && repo.sessionId === clientSessionId;

        if (!isAuthenticatedRow && !isGuestRow) {
            return NextResponse.json({ message: 'Unauthorized access to repository data' }, { status: 401 });
        }

        const analysis = await AnalysisResult.findOne({ repositoryId: resolvedParams.repoId }).lean();
        if (!analysis) {
            return NextResponse.json({ message: 'Analysis data not found' }, { status: 404 });
        }

        const { nodes, edges, metrics } = analysis;
        const criticalModules = metrics?.criticalModules || [];

        if (nodeId) {
            // Single node impact analysis
            const result = analyzeImpact(nodeId, nodes, edges, criticalModules);
            if (!result) {
                return NextResponse.json({ message: 'Node not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: result }, { status: 200 });
        }

        // Full impact report for all nodes
        const report = generateFullImpactReport(nodes, edges, criticalModules);

        return NextResponse.json({
            success: true,
            data: {
                report,
                summary: {
                    totalAnalyzed: report.length,
                    critical: report.filter((r) => r.riskLevel === 'critical').length,
                    moderate: report.filter((r) => r.riskLevel === 'moderate').length,
                    low: report.filter((r) => r.riskLevel === 'low').length,
                },
            },
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Impact analysis failed:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
