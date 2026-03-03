import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/connection';
import Repository from '@/lib/db/models/Repository';
import { runAnalysisPipeline } from '@/lib/analyzer/pipeline';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Parse the multipart form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const clientSessionId = formData.get('sessionId') as string | null;

        if (!file) {
            return NextResponse.json({ message: 'ZIP file is required' }, { status: 400 });
        }

        if (!file.name.endsWith('.zip')) {
            return NextResponse.json({ message: 'Must be a valid ZIP file' }, { status: 400 });
        }

        // Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Prep temp directories
        const uniqueId = uuidv4();
        const tempZipPath = path.join(os.tmpdir(), `traceon-upload-${uniqueId}.zip`);
        const extractPath = path.join(os.tmpdir(), `traceon-repo-${uniqueId}`);

        // Write buffer to temp zip file
        await fs.writeFile(tempZipPath, buffer);

        // Extract using adm-zip
        const zip = new AdmZip(tempZipPath);
        zip.extractAllTo(extractPath, true);

        // Remove the temporary zip file now that we extracted it
        await fs.unlink(tempZipPath).catch(err => console.warn('Failed to delete temp zip:', err));

        // Connect to database
        await dbConnect();

        // Generate or use existing sessionId for guest users
        const sessionId = session?.user?.id ? null : (clientSessionId || uuidv4());
        const userId = session?.user?.id || null;

        // Strip ".zip" for repo name
        const cleanName = file.name.replace('.zip', '');

        // Create the initial repository record
        const repository = await Repository.create({
            userId,
            repoUrl: 'local-upload',
            name: cleanName,
            owner: 'uploaded-zip',
            status: 'pending',
            sessionId,
        });

        const cleanupFunction = async () => {
            try {
                await fs.rm(extractPath, { recursive: true, force: true });
            } catch (err) {
                console.error('Failed to cleanup extracted zip directory', err);
            }
        };

        // Start background processing
        runAnalysisPipeline(repository._id.toString(), extractPath, cleanupFunction).catch(err => {
            console.error('Background analysis failed for ZIP payload:', err);
        });

        return NextResponse.json({
            success: true,
            repositoryId: repository._id,
            sessionId,
        }, { status: 202 });

    } catch (error: unknown) {
        console.error('Analyze upload error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal server error', error: msg }, { status: 500 });
    }
}
