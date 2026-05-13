import mongoose from 'mongoose';

const profileAnalysisSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
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
    aiAssessment: {
        archetype: { type: String, required: true },
        domainScores: {
            type: Map,
            of: Number,
            required: true,
        },
        domainDescriptions: {
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
    repositories: [{
        name: String,
        description: String,
        stargazers_count: Number,
        language: String,
        updated_at: String,
        html_url: String,
    }],
    commitFrequency: {
        last30Days: Number,
        last90Days: Number,
        last365Days: Number,
        longestStreak: Number,
    },
    pullRequestActivity: {
        totalPRsOpened: Number,
        totalPRsMerged: Number,
        avgTimeToMerge: Number,
        reviewedOthers: Number,
    },
    issueActivity: {
        totalOpened: Number,
        totalClosed: Number,
        avgResponseTime: Number,
    },
    accountAge: {
        years: Number,
        months: Number,
    },
    totalStarsReceived: Number,
    totalForksReceived: Number,
    lastAnalyzedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const ProfileAnalysis = mongoose.models.ProfileAnalysis || mongoose.model('ProfileAnalysis', profileAnalysisSchema);
