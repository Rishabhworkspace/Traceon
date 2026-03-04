import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email }).select('image');

        if (!user || !user.image || !user.image.startsWith('data:image/')) {
            return new NextResponse('Not found', { status: 404 });
        }

        const matches = user.image.match(/^data:([a-zA-Z0-9-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return new NextResponse('Invalid image format', { status: 400 });
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': type,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Avatar fetch error:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
