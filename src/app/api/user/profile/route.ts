import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import Repository from '@/lib/db/models/Repository';
import AnalysisResult from '@/lib/db/models/AnalysisResult';
import bcrypt from 'bcryptjs';

// ─── GET: Fetch user profile and stats ───────────────────────────
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Aggregate stats
        const repos = await Repository.find({ userId: user._id });
        const reposAnalyzed = repos.length;
        const totalFilesScanned = repos.reduce((sum, r) => sum + (r.fileCount || 0), 0);

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
                githubUsername: user.githubUsername,
                image: user.image?.startsWith('data:image/') ? `/api/user/avatar?t=${Date.now()}` : user.image,
                createdAt: user.createdAt,
            },
            stats: {
                reposAnalyzed,
                totalFilesScanned,
                memberSince: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// ─── POST: Update user profile ───────────────────────────────────
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
            if (typeof image !== 'string' || image.length > 5 * 1024 * 1024) {
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

        const safeImageReturn = user.image?.startsWith('data:image/')
            ? `/api/user/avatar?t=${Date.now()}`
            : user.image;

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                githubUsername: user.githubUsername,
                image: safeImageReturn,
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Internal server error while updating profile' }, { status: 500 });
    }
}

// ─── DELETE: Permanently delete user account and all data ────────
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 1. Find all repos belonging to this user
        const repos = await Repository.find({ userId: user._id });
        const repoIds = repos.map((r) => r._id);

        // 2. Delete all analysis results for those repos
        await AnalysisResult.deleteMany({ repositoryId: { $in: repoIds } });

        // 3. Delete all repositories
        await Repository.deleteMany({ userId: user._id });

        // 4. Delete the user
        await User.deleteOne({ _id: user._id });

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json({ message: 'Internal server error while deleting account' }, { status: 500 });
    }
}
