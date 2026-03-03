import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

export interface CloneResult {
    repoPath: string;
    cleanup: () => Promise<void>;
}

export async function cloneRepository(repoUrl: string): Promise<CloneResult> {
    // Generate a unique temporary directory
    const tempDir = path.join(os.tmpdir(), `traceon-${uuidv4()}`);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // Initialize simple-git
        const git: SimpleGit = simpleGit();

        // Clone purely for depth 1 to save time and bandwidth
        await git.clone(repoUrl, tempDir, ['--depth', '1']);

        const cleanup = async () => {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (err) {
                console.error(`Failed to cleanup directory ${tempDir}:`, err);
            }
        };

        return {
            repoPath: tempDir,
            cleanup,
        };
    } catch (error) {
        // If cloning fails, try to clean up the directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch { }

        throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
    }
}
