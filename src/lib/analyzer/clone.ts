import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';

export interface CloneResult {
    repoPath: string;
    cleanup: () => Promise<void>;
}

/**
 * Downloads a GitHub repository as a ZIP via codeload.github.com and extracts it.
 * Uses the direct download URL (no API, no redirects, no rate limits for public repos).
 * Extracts with adm-zip (pure JS, no native dependencies).
 */
export async function cloneRepository(repoUrl: string, commit: string = 'HEAD'): Promise<CloneResult> {
    const tempDir = path.join(os.tmpdir(), `traceon-${uuidv4()}`);
    const tempZip = `${tempDir}.zip`;

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // Parse owner/repo from the GitHub URL
        // A repository name can have dots (e.g. Portfolio-2.0). 
        // Using `([^/]+)` to grab the entire repo name. If there's `.git`, strip it.
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            throw new Error('Invalid GitHub URL format');
        }
        const [, owner, rawRepo] = match;
        const repo = rawRepo.replace(/\.git$/, '');

        // Direct download URL — no API calls, no redirects, no rate limits
        const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/${commit}`;

        console.log(`[Traceon] Downloading: ${zipUrl}`);

        const response = await fetch(zipUrl, {
            headers: { 'User-Agent': 'Traceon-Analyzer' },
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(
                `Download failed (${response.status}): ${response.statusText}. ` +
                `Check that https://github.com/${owner}/${repo} exists and is public. ${errorText}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write ZIP to temp file, extract with adm-zip, then delete the ZIP
        await fs.writeFile(tempZip, buffer);
        const zip = new AdmZip(tempZip);
        zip.extractAllTo(tempDir, true);
        await fs.unlink(tempZip).catch(() => { });

        // GitHub ZIPs contain a single root folder: {repo}-{branch}/
        // Find it and use it as the repo path, or use tempDir if flat
        const entries = await fs.readdir(tempDir, { withFileTypes: true });
        const dirs = entries.filter(e => e.isDirectory());

        let repoPath = tempDir;
        if (dirs.length === 1 && entries.filter(e => e.isFile()).length === 0) {
            // Single root directory (standard GitHub ZIP layout)
            repoPath = path.join(tempDir, dirs[0].name);
        }

        console.log(`[Traceon] Extracted to: ${repoPath}`);

        const cleanup = async () => {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (err) {
                console.error(`Failed to cleanup directory ${tempDir}:`, err);
            }
        };

        return { repoPath, cleanup };
    } catch (error) {
        // Cleanup on failure
        try { await fs.rm(tempDir, { recursive: true, force: true }); } catch { }
        try { await fs.unlink(tempZip); } catch { }

        throw new Error(
            `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
