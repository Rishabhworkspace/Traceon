import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { githubUsername } = await req.json();

        // Allow unsetting the username if it's explicitly an empty string, otherwise validate
        if (githubUsername !== undefined && githubUsername !== '') {
            if (typeof githubUsername !== 'string' || githubUsername.length > 39) {
                return NextResponse.json({ message: 'Invalid GitHub username' }, { status: 400 });
            }
        }

        await dbConnect();

        // Use email to find and update because it's guaranteed to be unique and present
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { githubUsername: githubUsername === '' ? undefined : githubUsername } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            githubUsername: updatedUser.githubUsername
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Internal server error while updating profile' }, { status: 500 });
    }
}
