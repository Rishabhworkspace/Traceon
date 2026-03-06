import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import File from '@/lib/db/models/File';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import { extractGraphData } from '@/lib/analyzer/extractor';
import { fetchRecentCommits } from '@/lib/analyzer/github';
import { cloneRepository } from '@/lib/analyzer/clone';

export async function runAnalysisPipeline(repoId: string, repoPath: string, repoUrl: string, cleanupFunction?: (() => Promise<void>) | null) {
    const cleanups: Array<() => Promise<void>> = [];
    if (cleanupFunction) cleanups.push(cleanupFunction);

    try {
        await dbConnect();
        await Repository.findByIdAndUpdate(repoId, { status: 'scanning' });

        // 1. Fetch recent commits (Top 3)
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let commits: any[] = [];
        if (match) {
            const [, owner, rawRepo] = match;
            const repo = rawRepo.replace(/\.git$/, '');
            commits = await fetchRecentCommits(owner, repo, 5);
        }

        // 2. Extract Data for HEAD
        await Repository.findByIdAndUpdate(repoId, { status: 'parsing' });
        const headResult = await extractGraphData(repoId, repoPath);

        await Repository.findByIdAndUpdate(repoId, { fileCount: headResult.filesToReturn.length });

        const chunkSize = 500;
        for (let i = 0; i < headResult.filesToReturn.length; i += chunkSize) {
            await File.insertMany(headResult.filesToReturn.slice(i, i + chunkSize));
        }

        // 3. Process History Snapshots
        await Repository.findByIdAndUpdate(repoId, { status: 'analyzing' });

        const historySnapshots = [];

        // Skip index 0 assuming it matches HEAD 
        // Just process the older ones from index 1..2
        if (commits.length > 1) {
            for (let i = 1; i < commits.length; i++) {
                const commit = commits[i];
                try {
                    console.log(`[Traceon] Analyzing historical commit: ${commit.sha}`);
                    const cloneRes = await cloneRepository(repoUrl, commit.sha);
                    cleanups.push(cloneRes.cleanup);

                    const histData = await extractGraphData(repoId, cloneRes.repoPath);
                    historySnapshots.push({
                        commitHash: commit.sha,
                        message: commit.message,
                        date: commit.date,
                        author: commit.author,
                        nodes: histData.graphData.nodes,
                        edges: histData.graphData.edges
                    });
                } catch {
                    console.warn(`[Traceon] Skipping history for commit ${commit.sha} due to error`);
                }
            }
        }

        // 4. Save Final Analysis Result
        await AnalysisResult.create({
            repositoryId: repoId,
            nodes: headResult.graphData.nodes,
            edges: headResult.graphData.edges,
            metrics: headResult.graphData.metrics,
            history: historySnapshots.length > 0 ? historySnapshots : undefined
        });

        await Repository.findByIdAndUpdate(repoId, {
            status: 'complete',
            analyzedAt: new Date(),
        });

    } catch (err: unknown) {
        console.error('Analysis process failed:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error occurred during analysis';
        await Repository.findByIdAndUpdate(repoId, {
            status: 'failed',
            errorMessage: msg
        });
    } finally {
        for (const cleanup of cleanups) {
            await cleanup().catch(() => { });
        }
    }
}
