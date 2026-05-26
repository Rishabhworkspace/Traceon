import mongoose from 'mongoose';

const profileAnalysisSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
    },
    schemaVersion: {
        type: Number,
        default: 2,
        index: true,
    },
    avatarUrl: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: null,
    },
    techStack: {
        type: Map,
        of: Number, // Language -> Byte Count
        default: {},
    },

    // ─── CURISM Deterministic Scores (0–10 scale) ───
    curismScores: {
        reliability: { type: Number, required: true },
        security: { type: Number, required: true },
        maintainability: { type: Number, required: true },
        influence: { type: Number, required: true },
        contribution: { type: Number, required: true },
        uniqueness: { type: Number, required: true },
    },

    // ─── ACID Breakdown (Uniqueness sub-dimensions) ───
    acidBreakdown: {
        architecture: { type: Number, default: 0 },
        crossDomain: { type: Number, default: 0 },
        innovation: { type: Number, default: 0 },
        documentation: { type: Number, default: 0 },
    },

    // ─── Master Score & Grade ───
    masterScore: {
        finalScore: { type: Number, required: true },
        grade: { type: String, enum: ['C', 'B', 'A', 'S', 'S+'], required: true },
        gradeTitle: { type: String, required: true },
        hardSkills: { type: Number, required: true },
        softSkills: { type: Number, required: true },
        builderSkills: { type: Number, required: true },
        percentile: { type: Number },
    },

    // ─── AI Qualitative Assessment ───
    aiAssessment: {
        archetype: { type: String, required: true },
        curismDescriptions: {
            type: Map,
            of: String,
            required: true,
        },
        engineeringDNA: {
            problemSolving: { type: String, required: true },
            architectureMaturity: { type: String, required: true },
            documentation: { type: String, required: true },
        },
        traits: {
            strengths: [{ type: String }],
            weaknesses: [{ type: String }],
        },
        skillsByDomain: [{
            domain: { type: String, required: true },
            skills: [{ type: String }]
        }],
    },

    // ─── Repository Data ───
    repositories: [{
        name: String,
        description: String,
        stargazers_count: Number,
        forks_count: Number,
        language: String,
        topics: [String],
        updated_at: String,
        html_url: String,
    }],
    commitFrequency: {
        last30Days: Number,
        last90Days: Number,
        last365Days: Number,
        activeDaysLastYear: Number,
    },
    pullRequestActivity: {
        totalPRsOpened: Number,
        totalPRsMerged: Number,
        externalPRsMerged: Number,
        prReviewsDone: Number,
    },
    issueActivity: {
        totalOpened: Number,
        externalIssues: Number,
    },
    accountAge: {
        years: Number,
        months: Number,
    },
    totalStarsReceived: Number,
    totalForksReceived: Number,
    orgsCount: Number,
    lastAnalyzedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const ProfileAnalysis = mongoose.models.ProfileAnalysis || mongoose.model('ProfileAnalysis', profileAnalysisSchema);
