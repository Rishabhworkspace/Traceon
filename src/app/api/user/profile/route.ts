import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { githubUsername, name, image, currentPassword, newPassword } = body;

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).select('+passwordHash');
        if (!user) {
            return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
        }

        // GitHub username update
        if (githubUsername !== undefined) {
            if (githubUsername !== '' && (typeof githubUsername !== 'string' || githubUsername.length > 39)) {
                return NextResponse.json({ message: 'Invalid GitHub username' }, { status: 400 });
            }
            user.githubUsername = githubUsername === '' ? undefined : githubUsername;
        }

        // Name update
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return NextResponse.json({ message: 'Invalid name' }, { status: 400 });
            }
            user.name = name.trim();
        }

        // Image update (base64 or URL)
        if (image !== undefined) {
            if (typeof image !== 'string' || image.length > 5 * 1024 * 1024) { // ~5MB text limit 
                return NextResponse.json({ message: 'Image too large or invalid' }, { status: 400 });
            }
            user.image = image === '' ? undefined : image;
        }

        // Password update
        if (currentPassword && newPassword) {
            if (!user.passwordHash) {
                return NextResponse.json({ message: 'This account uses an external provider for sign in. You cannot change your password.' }, { status: 400 });
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 });
            }
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        // Prevent sending a massive base64 payload back to the client unless necessary
        const safeImageReturn = user.image?.startsWith('data:image/')
            ? `/api/user/avatar?t=${Date.now()}`
            : user.image;

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                githubUsername: user.githubUsername,
                image: safeImageReturn
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Internal server error while updating profile' }, { status: 500 });
    }
}
