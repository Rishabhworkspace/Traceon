import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const session = await getServerSession(authOptions);
        await dbConnect();

        const repository = await Repository.findById(id);

        if (!repository) {
            return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
        }

        // Basic authorization check - allow session users if they own it, or matching guest sessionId
        // Need to pass sessionId as search param to authorize guests
        const { searchParams } = new URL(req.url);
        const clientSessionId = searchParams.get('sessionId');

        const isAuthenticatedRow = repository.userId?.toString() === session?.user?.id;
        const isGuestRow = repository.sessionId && repository.sessionId === clientSessionId;

        if (!isAuthenticatedRow && !isGuestRow) {
            return NextResponse.json({ message: 'Unauthorized access to repository' }, { status: 401 });
        }

        return NextResponse.json({ success: true, repository }, { status: 200 });

    } catch (error: unknown) {
        console.error('Fetch repository error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal server error', error: msg }, { status: 500 });
    }
}
