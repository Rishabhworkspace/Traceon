import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import AnalysisResult from '@/lib/db/models/AnalysisResult';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        await connectDB();

        // Count successfully analyzed repositories
        const reposAnalyzed = await Repository.countDocuments({ status: 'complete' });

        // Sum up total files parsed
        const filesParsedResult = await Repository.aggregate([
            { $match: { status: 'complete' } },
            { $group: { _id: null, total: { $sum: "$fileCount" } } }
        ]);
        const filesParsed = filesParsedResult[0]?.total || 0;

        // Sum up total edges mapped
        const edgesMappedResult = await AnalysisResult.aggregate([
            { $project: { edgeCount: { $size: { $ifNull: ["$edges", []] } } } },
            { $group: { _id: null, total: { $sum: "$edgeCount" } } }
        ]);
        const edgesMapped = edgesMappedResult[0]?.total || 0;

        return NextResponse.json({
            reposAnalyzed,
            filesParsed,
            edgesMapped,
            avgAnalysis: '<30s',
        });
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
