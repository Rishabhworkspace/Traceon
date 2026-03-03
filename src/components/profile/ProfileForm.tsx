'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { Camera, Save, Lock, User } from 'lucide-react';

export default function ProfileForm({ session }: { session: Session }) {
    const { update } = useSession();

    // State for general info
    const [name, setName] = useState(session?.user?.name || '');
    const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image || null);
    const [base64Image, setBase64Image] = useState<string | null>(null);

    // State for security
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // State for submission
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setBase64Image(base64String);
            setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload: Record<string, string> = {};

        if (name !== session?.user?.name) payload.name = name;
        if (base64Image) payload.image = base64Image;
        if (currentPassword && newPassword) {
            payload.currentPassword = currentPassword;
            payload.newPassword = newPassword;
        }

        if (Object.keys(payload).length === 0) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update client session so UI reflects changes immediately globally
            await update({
                name: data.user.name,
                image: data.user.image,
            });

            setSuccess('Profile updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setBase64Image(null); // Clear base64 payload but keep preview

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // If using Github/Google OAuth, password changes aren't applicable
    const isCredentialsUser = session?.user?.provider === 'credentials';

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-12">
            {error && (
                <div className="p-4 rounded-xl bg-rose/5 border border-rose/10 text-rose font-mono text-sm">
                    ! {error}
                </div>
            )}
            {success && (
                <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/10 text-emerald font-mono text-sm">
                    ✓ {success}
                </div>
            )}

            <div className="card p-6 border-stroke">
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-emerald" />
                    <h2 className="text-xl font-mono text-text-0">General Information</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-32 h-32 rounded-full border-2 border-stroke bg-surface-1 overflow-hidden group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-2 text-text-3 text-4xl font-display">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                            >
                                <Camera className="w-8 h-8 text-white mb-2" />
                                <span className="text-white text-xs font-mono">Upload</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-text-2 hover:text-emerald transition-colors font-mono"
                        >
                            Change Picture
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label className="block text-sm font-mono text-text-2 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-surface-0 border border-stroke rounded-lg px-4 py-2 text-text-0 focus:border-emerald outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-text-2 mb-2">Email Address</label>
                            <input
                                type="text"
                                value={session?.user?.email || ''}
                                disabled
                                className="w-full bg-surface-1 border border-stroke rounded-lg px-4 py-2 text-text-3 cursor-not-allowed opacity-70"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-text-2 mb-2">Authentication Provider</label>
                            <div className="inline-flex items-center px-3 py-1 rounded-full border border-stroke bg-surface-1 text-xs font-mono capitalize">
                                {session?.user?.provider || 'Native'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCredentialsUser && (
                <div className="card p-6 border-stroke">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="w-5 h-5 text-amber" />
                        <h2 className="text-xl font-mono text-text-0">Change Password</h2>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-mono text-text-2 mb-2">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-surface-0 border border-stroke rounded-lg px-4 py-2 text-text-0 focus:border-amber outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-mono text-text-2 mb-2">New Password <span className="text-text-3 font-sans text-xs">(min 6 chars)</span></label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-surface-0 border border-stroke rounded-lg px-4 py-2 text-text-0 focus:border-amber outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={loading || (!base64Image && name === session?.user?.name && !newPassword)}
                    className="btn-cta flex items-center gap-2 !px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-surface-0 border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
