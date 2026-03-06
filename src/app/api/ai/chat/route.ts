import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import connectDB from '@/lib/db/connection';
import AnalysisResult from '@/lib/db/models/AnalysisResult';

// Active providers — only Groq and Cerebras are in use
const cerebras = createOpenAI({
    baseURL: 'https://api.cerebras.ai/v1',
    apiKey: process.env.CEREBRAS_API_KEY || 'MISSING_KEY',
});

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY',
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
                case 'llama3.1-8b':
                    if (process.env.CEREBRAS_API_KEY) {
                        selectedLanguageModel = cerebras('llama3.1-8b');
                    }
                    break;
                case 'llama-3.3-70b-versatile':
                    if (process.env.GROQ_API_KEY) {
                        selectedLanguageModel = groq('llama-3.3-70b-versatile');
                    }
                    break;
                default:
                    // Unknown model, fall through to missing key error
                    break;
            }
        } catch (e) {
            console.error("Model initialization error", e);
        }

        if (!selectedLanguageModel) {
            const providerName = model === 'llama3.1-8b' ? 'CEREBRAS' : 'GROQ';
            const envKey = model === 'llama3.1-8b' ? 'CEREBRAS_API_KEY' : 'GROQ_API_KEY';
            return new NextResponse(
                JSON.stringify({
                    error: `API Key for ${providerName} is not configured. Add ${envKey} to your .env.local file, then restart the dev server.`,
                    message: "Model is not available without the required API key."
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

        return result.toTextStreamResponse();

    } catch (error: unknown) {
        console.error('AI Chat Error:', error);

        // Handle gracefully if missing key
        const errMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        if (errMsg.includes('api_key') || errMsg.includes('API key')) {
            return new NextResponse(
                JSON.stringify({ error: 'API key is missing or invalid for the selected model. Add it to .env.local.' }),
                { status: 401 }
            );
        }

        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error', details: errMsg }),
            { status: 500 }
        );
    }
}
