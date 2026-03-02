import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGraphNode {
    id: string;
    label: string;
    type: 'entry' | 'module' | 'utility' | 'component' | 'config' | 'other';
    path: string;
    imports: string[];
    exports: string[];
    loc: number;
    inDegree: number;
    outDegree: number;
}

export interface IGraphEdge {
    source: string;
    target: string;
    relationship: 'imports' | 'exports' | 'calls';
    weight: number;
}

export interface IMetrics {
    totalFiles: number;
    totalDependencies: number;
    dependencyDensity: number;
    criticalModules: string[];
    circularDependencies: string[][];
    fileTypeDistribution: Record<string, number>;
}

export interface IAnalysisResult extends Document {
    repositoryId: mongoose.Types.ObjectId;
    nodes: IGraphNode[];
    edges: IGraphEdge[];
    metrics: IMetrics;
    createdAt: Date;
}

const GraphNodeSchema = new Schema<IGraphNode>(
    {
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: {
            type: String,
            enum: ['entry', 'module', 'utility', 'component', 'config', 'other'],
            default: 'module',
        },
        path: { type: String, required: true },
        imports: [{ type: String }],
        exports: [{ type: String }],
        loc: { type: Number, default: 0 },
        inDegree: { type: Number, default: 0 },
        outDegree: { type: Number, default: 0 },
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

const MetricsSchema = new Schema<IMetrics>(
    {
        totalFiles: { type: Number, default: 0 },
        totalDependencies: { type: Number, default: 0 },
        dependencyDensity: { type: Number, default: 0 },
        criticalModules: [{ type: String }],
        circularDependencies: [[{ type: String }]],
        fileTypeDistribution: { type: Map, of: Number },
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
    },
    {
        timestamps: true,
    }
);

const AnalysisResult: Model<IAnalysisResult> =
    mongoose.models.AnalysisResult ||
    mongoose.model<IAnalysisResult>('AnalysisResult', AnalysisResultSchema);

export default AnalysisResult;
