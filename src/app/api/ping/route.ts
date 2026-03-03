import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';

export async function GET() {
    try {
        const conn = await dbConnect();
        return NextResponse.json({ success: true, db: conn.connection.name });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
}
