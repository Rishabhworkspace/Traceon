import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import connectDB from '@/lib/db/connection';
import AnalysisResult from '@/lib/db/models/AnalysisResult';

// Active providers
const cerebras = createOpenAI({
    baseURL: 'https://api.cerebras.ai/v1',
    apiKey: process.env.CEREBRAS_API_KEY || 'MISSING_KEY',
});

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY',
});

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
});

export async function POST(req: NextRequest) {
    try {
        const { messages, repoId, model } = await req.json();

        // 0. Enforce strict character limits on input to prevent token/quota exhaustion
        const inputString = JSON.stringify(messages || []);
        if (inputString.length > 20000) {
            return new NextResponse(
                JSON.stringify({ error: 'Message payload too large (exceeds 20,000 characters). Please clear some chat history or shorten your query.' }),
                { status: 413, headers: { 'Content-Type': 'application/json' } }
            );
        }

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
        let providerNameForError = '';
        let envKeyForError = '';

        try {
            switch (model) {
                case 'llama3.1-8b':
                    if (process.env.CEREBRAS_API_KEY) {
                        selectedLanguageModel = cerebras('llama3.1-8b');
                    } else {
                        providerNameForError = 'CEREBRAS';
                        envKeyForError = 'CEREBRAS_API_KEY';
                    }
                    break;
                case 'llama-3.3-70b-versatile':
                    if (process.env.GROQ_API_KEY) {
                        selectedLanguageModel = groq('llama-3.3-70b-versatile');
                    } else {
                        providerNameForError = 'GROQ';
                        envKeyForError = 'GROQ_API_KEY';
                    }
                    break;
                case 'gemini-1.5-pro':
                case 'gemini-1.5-flash':
                case 'gemini-2.5-pro':
                case 'gemini-2.5-flash':
                    if (process.env.GEMINI_API_KEY) {
                        selectedLanguageModel = google(model);
                    } else {
                        providerNameForError = 'GOOGLE GEMINI';
                        envKeyForError = 'GEMINI_API_KEY';
                    }
                    break;
                default:
                    // Unknown model, fall through to missing key error (using gemini as default missing for message)
                    providerNameForError = 'Selected Provider';
                    envKeyForError = 'API_KEY';
                    break;
            }
        } catch (e) {
            console.error("Model initialization error", e);
        }

        if (!selectedLanguageModel) {
            return new NextResponse(
                JSON.stringify({
                    error: `API Key for ${providerNameForError} is not configured. Add ${envKeyForError} to your .env.local file, then restart the dev server.`,
                    message: "Model is not available without the required API key."
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 3. Limit conversation history to avoid token overflow
        // Only send the last 10 messages (plus system prompt is separate)
        const recentMessages = messages.length > 10 ? messages.slice(-10) : messages;

        // 4. Stream the response directly to the client
        try {
            console.log('Sending to AI:', JSON.stringify(recentMessages, null, 2));
            const result = streamText({
                model: selectedLanguageModel,
                system: systemPrompt,
                messages: recentMessages,
            });

            return result.toTextStreamResponse();
        } catch (streamError: unknown) {
            console.error('AI Stream Error:', streamError);
            const msg = streamError instanceof Error ? streamError.message : 'Stream initialization failed';

            // Check for rate limit
            if (msg.includes('rate') || msg.includes('429') || msg.includes('quota')) {
                return new NextResponse(
                    JSON.stringify({ error: 'Rate limit reached. Please wait a moment and try again.' }),
                    { status: 429, headers: { 'Content-Type': 'application/json' } }
                );
            }

            return new NextResponse(
                JSON.stringify({ error: `Model error: ${msg}` }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }

    } catch (error: unknown) {
        console.error('AI Chat Error:', error);

        const errMsg = error instanceof Error ? error.message : 'Unknown error occurred';

        if (errMsg.includes('rate') || errMsg.includes('429') || errMsg.includes('quota')) {
            return new NextResponse(
                JSON.stringify({ error: 'Rate limit reached. Please wait a moment and try again.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (errMsg.includes('api_key') || errMsg.includes('API key')) {
            return new NextResponse(
                JSON.stringify({ error: 'API key is missing or invalid for the selected model. Add it to .env.local.' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error', details: errMsg }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
