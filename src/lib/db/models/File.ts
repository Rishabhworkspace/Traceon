import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFile extends Document {
    repositoryId: mongoose.Types.ObjectId;
    path: string;
    name: string;
    extension: string;
    type: 'file' | 'directory';
    loc: number;
    imports: string[];
    exports: string[];
    functions: string[];
    classes: string[];
    createdAt: Date;
}

const FileSchema = new Schema<IFile>(
    {
        repositoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Repository',
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        extension: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            enum: ['file', 'directory'],
            default: 'file',
        },
        loc: {
            type: Number,
            default: 0,
        },
        imports: [{ type: String }],
        exports: [{ type: String }],
        functions: [{ type: String }],
        classes: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

FileSchema.index({ repositoryId: 1 });

const File: Model<IFile> =
    mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default File;
