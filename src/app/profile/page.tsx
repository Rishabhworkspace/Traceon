import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-5 max-w-4xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-text-0 mb-8 animate-fade-up">
                Profile Settings
            </h1>
            <div className="animate-fade-up animate-delay-1">
                <ProfileForm session={session} />
            </div>
        </div>
    );
}
