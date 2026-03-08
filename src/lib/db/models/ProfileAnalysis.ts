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
    lastAnalyzedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Delete the old cached model so Next.js HMR doesn't use the old schema
delete mongoose.models.ProfileAnalysis;
export const ProfileAnalysis = mongoose.model('ProfileAnalysis', profileAnalysisSchema);
