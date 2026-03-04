import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

export interface CloneResult {
    repoPath: string;
    cleanup: () => Promise<void>;
}

/**
 * Downloads a GitHub repository as a tarball via the GitHub API and extracts it.
 * This avoids the need for `git` to be installed on the host (e.g. Vercel serverless).
 */
export async function cloneRepository(repoUrl: string): Promise<CloneResult> {
    const tempDir = path.join(os.tmpdir(), `traceon-${uuidv4()}`);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // Parse owner/repo from the GitHub URL
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
        if (!match) {
            throw new Error('Invalid GitHub URL format');
        }
        const [, owner, repo] = match;

        // Try GitHub API tarball first (works without git binary)
        const tarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball`;

        const response = await fetch(tarballUrl, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'Traceon-Analyzer',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract the tarball
        await extractTarball(buffer, tempDir);

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
        // If download fails, try to clean up the directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch { }

        throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Extract a .tar.gz buffer into a target directory.
 * GitHub tarballs have a single root directory (e.g. owner-repo-sha/),
 * so we strip that prefix to place files directly in targetDir.
 */
async function extractTarball(buffer: Buffer, targetDir: string): Promise<void> {
    const { Readable } = await import('stream');
    const zlib = await import('zlib');

    // Dynamically import tar — install it as a dependency
    let tar: typeof import('tar');
    try {
        tar = await import('tar');
    } catch {
        throw new Error('tar package is required. Run: npm install tar');
    }

    return new Promise((resolve, reject) => {
        const stream = Readable.from(buffer);
        stream
            .pipe(zlib.createGunzip())
            .pipe(
                tar.extract({
                    cwd: targetDir,
                    strip: 1, // Strip the root directory (owner-repo-sha/)
                })
            )
            .on('finish', resolve)
            .on('error', reject);
    });
}
