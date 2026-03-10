// src/app/api/profile/[username]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOrAnalyzeProfile } from '@/lib/profile/service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const resolvedParams = await params;
        const username = resolvedParams.username;

        const result = await getOrAnalyzeProfile(username);
        return NextResponse.json(result);


    } catch (error: any) {
        console.error('[Profile API Error]:', error);

        // Handle specific fetcher errors (e.g., 404 User Not Found)
        if (error.message === 'User not found') {
            return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
        }

        if (error.message === 'GitHub API rate limit exceeded') {
            return NextResponse.json({ error: 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.' }, { status: 429 });
        }

        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred during profile analysis' },
            { status: 500 }
        );
    }
}
