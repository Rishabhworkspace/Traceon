import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from './db/connection';
import User from './db/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select(
                    '+passwordHash'
                );

                if (!user || !user.passwordHash) {
                    throw new Error('Invalid email or password');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                };
            },
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google' || account?.provider === 'github') {
                try {
                    await dbConnect();
                    let dbUser = await User.findOne({ email: user.email });

                    if (!dbUser) {
                        dbUser = await User.create({
                            email: user.email,
                            name: user.name || 'Developer',
                        });
                    }

                    // Attach the MongoDB ID to the user object, which is passed to the JWT callback
                    user.id = dbUser._id.toString();
                    return true;
                } catch (error) {
                    console.error("Error creating user during OAuth sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        newUser: '/signup',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
