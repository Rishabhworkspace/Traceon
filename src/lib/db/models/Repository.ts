import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepository extends Document {
    userId: mongoose.Types.ObjectId | null;
    repoUrl: string;
    name: string;
    owner: string;
    status: 'pending' | 'cloning' | 'scanning' | 'parsing' | 'analyzing' | 'complete' | 'failed';
    sessionId: string | null;
    fileCount: number;
    analyzedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        repoUrl: {
            type: String,
            required: [true, 'Repository URL is required'],
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        owner: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'cloning', 'scanning', 'parsing', 'analyzing', 'complete', 'failed'],
            default: 'pending',
        },
        sessionId: {
            type: String,
            default: null,
        },
        fileCount: {
            type: Number,
            default: 0,
        },
        analyzedAt: {
            type: Date,
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

RepositorySchema.index({ userId: 1 });
RepositorySchema.index({ sessionId: 1 });
RepositorySchema.index({ userId: 1, status: 1 });

const Repository: Model<IRepository> =
    mongoose.models.Repository || mongoose.model<IRepository>('Repository', RepositorySchema);

export default Repository;
