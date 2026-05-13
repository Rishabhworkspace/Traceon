// src/app/api/profile/[username]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOrAnalyzeProfile } from '@/lib/profile/service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        // Rate Limiting (5 requests per 1 minute)
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
        const rateLimitResult = rateLimit(ip, 5, 60 * 1000);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too Many Requests. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                    }
                }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
