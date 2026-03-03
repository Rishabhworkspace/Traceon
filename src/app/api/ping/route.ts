import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';

export async function GET() {
    try {
        const conn = await dbConnect();
        return NextResponse.json({ success: true, db: conn.connection.name });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        return NextResponse.json({ success: false, error: msg, stack }, { status: 500 });
    }
}
