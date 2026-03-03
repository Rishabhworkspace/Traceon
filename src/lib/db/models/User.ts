import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash?: string;
    name: string;
    githubUsername?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            select: false, // Security best practice from MongoDB skills
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        githubUsername: {
            type: String,
            trim: true,
            sparse: true, // Use sparse index since many users won't have it initially
        },
        image: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index automatically created by unique: true on email

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
