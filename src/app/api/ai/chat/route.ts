import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import connectDB from '@/lib/db/connection';
import AnalysisResult from '@/lib/db/models/AnalysisResult';

// Setup providers with error handling if keys are missing
// The user will add these keys to their .env file later
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY',
});

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'MISSING_KEY',
});

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'MISSING_KEY',
});

export async function POST(req: NextRequest) {
    try {
        const { messages, repoId, model } = await req.json();

        // 1. Fetch Repository Architecture Context
        await connectDB();
        const analysis = await AnalysisResult.findOne({ repositoryId: repoId })
            .select('metrics nodes')
            .lean();

        let systemPrompt = `You are Traceon AI, an expert software architecture assistant.\n`;
        systemPrompt += `You are analyzing a codebase dependency graph.\n`;

        if (analysis) {
            // Provide context about the codebase
            const nodeCount = analysis.nodes?.length || 0;
            const criticalNodes = analysis.metrics?.criticalModules?.slice(0, 10).join(', ') || 'None identified';

            systemPrompt += `\nRepository Context:\n`;
            systemPrompt += `- Total Files Parsed: ${analysis.metrics?.totalFiles || nodeCount}\n`;
            systemPrompt += `- Total Dependency Edges: ${analysis.metrics?.totalDependencies || 'Unknown'}\n`;
            systemPrompt += `- Top Critical Nodes (High In-Degree): ${criticalNodes}\n\n`;
            systemPrompt += `Answer the developer's questions clearly, concisely, and professionally.\n`;
        }

        // 2. Select the Provider model
        let selectedLanguageModel;

        try {
            switch (model) {
                case 'gpt-4o':
                    if (process.env.OPENAI_API_KEY) {
                        selectedLanguageModel = openai('gpt-4o');
                    }
                    break;
                case 'gemini-1.5-pro':
                    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                        selectedLanguageModel = google('gemini-1.5-pro-latest'); // Or standard gemini-1.5-pro
                    }
                    break;
                case 'claude-3-5-sonnet-20241022':
                    if (process.env.ANTHROPIC_API_KEY) {
                        selectedLanguageModel = anthropic('claude-3-5-sonnet-20241022');
                    }
                    break;
                default:
                    // Fallback to whatever is available or just fail gracefully below
                    break;
            }
        } catch (e) {
            console.error("Model initialization error", e);
        }

        if (!selectedLanguageModel) {
            // Mock response if API key isn't provided yet
            const missingKeyProvider = model.split('-')[0].toUpperCase();
            return new NextResponse(
                JSON.stringify({
                    error: `API Key for ${missingKeyProvider} is not configured yet. Please add it to your .env file to use this model.`,
                    message: "The developer has requested API keys to be added later. Returning mock response."
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 3. Stream the response directly to the client
        const result = streamText({
            model: selectedLanguageModel,
            system: systemPrompt,
            messages: messages,
        });

        return new Response(result.textStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error: any) {
        console.error('AI Chat Error:', error);

        // Handle gracefully if missing key
        const errMsg = error?.message || 'Unknown error occurred';
        if (errMsg.includes('api_key') || errMsg.includes('API key')) {
            return new NextResponse(
                JSON.stringify({ error: 'API key is missing or invalid for the selected model. Add it to .env.' }),
                { status: 401 }
            );
        }

        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error', details: errMsg }),
            { status: 500 }
        );
    }
}
