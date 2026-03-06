import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGraphNode {
    id: string;
    label: string;
    type: 'type' | 'entry' | 'module' | 'utility' | 'component' | 'config' | 'other';
    path: string;
    imports: string[];
    exports: string[];
    loc: number;
    inDegree: number;
    outDegree: number;
    packageName?: string;
}

export interface IGraphEdge {
    source: string;
    target: string;
    relationship: 'imports' | 'exports' | 'calls';
    weight: number;
}

export interface IWorkspacePackage {
    name: string;
    path: string;
    version?: string;
    dependencies: string[];
}

export interface IWorkspaceInfo {
    type: 'turborepo' | 'nx' | 'lerna' | 'pnpm' | 'npm' | 'yarn' | 'none';
    packages: IWorkspacePackage[];
    rootName?: string;
}

export interface IMetrics {
    totalFiles: number;
    totalDependencies: number;
    dependencyDensity: number;
    criticalModules: string[];
    circularDependencies: string[][];
    fileTypeDistribution: Record<string, number>;
    workspaceInfo?: IWorkspaceInfo;
}

export interface IAnalysisResult extends Document {
    repositoryId: mongoose.Types.ObjectId;
    nodes: IGraphNode[];
    edges: IGraphEdge[];
    metrics: IMetrics;
    history?: {
        commitHash: string;
        message: string;
        date: string;
        author?: string;
        nodes: IGraphNode[];
        edges: IGraphEdge[];
    }[];
    createdAt: Date;
}

const GraphNodeSchema = new Schema<IGraphNode>(
    {
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: {
            type: String,
            enum: ['type', 'entry', 'module', 'utility', 'component', 'config', 'other'],
            default: 'module',
        },
        path: { type: String, required: true },
        imports: [{ type: String }],
        exports: [{ type: String }],
        loc: { type: Number, default: 0 },
        inDegree: { type: Number, default: 0 },
        outDegree: { type: Number, default: 0 },
        packageName: { type: String },
    },
    { _id: false }
);

const GraphEdgeSchema = new Schema<IGraphEdge>(
    {
        source: { type: String, required: true },
        target: { type: String, required: true },
        relationship: {
            type: String,
            enum: ['imports', 'exports', 'calls'],
            default: 'imports',
        },
        weight: { type: Number, default: 1 },
    },
    { _id: false }
);

const WorkspacePackageSchema = new Schema(
    {
        name: { type: String, required: true },
        path: { type: String, required: true },
        version: { type: String },
        dependencies: [{ type: String }],
    },
    { _id: false }
);

const WorkspaceInfoSchema = new Schema(
    {
        type: { type: String, enum: ['turborepo', 'nx', 'lerna', 'pnpm', 'npm', 'yarn', 'none'], default: 'none' },
        packages: [WorkspacePackageSchema],
        rootName: { type: String },
    },
    { _id: false }
);

const MetricsSchema = new Schema<IMetrics>(
    {
        totalFiles: { type: Number, default: 0 },
        totalDependencies: { type: Number, default: 0 },
        dependencyDensity: { type: Number, default: 0 },
        criticalModules: [{ type: String }],
        circularDependencies: [[{ type: String }]],
        fileTypeDistribution: { type: Object, default: {} },
        workspaceInfo: { type: WorkspaceInfoSchema },
    },
    { _id: false }
);

const HistorySchema = new Schema(
    {
        commitHash: { type: String, required: true },
        message: { type: String, required: true },
        date: { type: String, required: true },
        author: { type: String },
        nodes: [GraphNodeSchema],
        edges: [GraphEdgeSchema],
    },
    { _id: false }
);

const AnalysisResultSchema = new Schema<IAnalysisResult>(
    {
        repositoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Repository',
            required: true,
            unique: true,
        },
        nodes: [GraphNodeSchema],
        edges: [GraphEdgeSchema],
        metrics: MetricsSchema,
        history: {
            type: [HistorySchema],
            default: undefined,
        },
    },
    {
        timestamps: true,
    }
);

const AnalysisResult: Model<IAnalysisResult> =
    mongoose.models.AnalysisResult ||
    mongoose.model<IAnalysisResult>('AnalysisResult', AnalysisResultSchema);

export default AnalysisResult;
