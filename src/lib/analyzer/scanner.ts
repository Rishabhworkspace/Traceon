import fs from 'fs/promises';
import path from 'path';

export interface ScannedFile {
    path: string;       // relative path from root
    name: string;       // file name
    extension: string;  // e.g., '.ts', '.js'
    size: number;
}

const IGNORE_DIRS = new Set([
    '.git',
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    '.vercel',
    'out'
]);

const IGNORE_FILES = new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store'
]);

// Language extensions we care about right now
const ALLOWED_EXTENSIONS = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.scss'
]);

export async function scanDirectory(
    dirPath: string,
    basePath: string = dirPath
): Promise<ScannedFile[]> {
    const results: ScannedFile[] = [];

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (IGNORE_DIRS.has(entry.name)) {
                    continue;
                }
                const fullPath = path.join(dirPath, entry.name);
                const subResults = await scanDirectory(fullPath, basePath);
                results.push(...subResults);
            } else if (entry.isFile()) {
                if (IGNORE_FILES.has(entry.name)) {
                    continue;
                }

                const ext = path.extname(entry.name);
                if (ALLOWED_EXTENSIONS.size > 0 && !ALLOWED_EXTENSIONS.has(ext) && ext !== '') {
                    continue;
                }

                const fullPath = path.join(dirPath, entry.name);
                // Ensure standard cross-platform relative path
                const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');
                const stat = await fs.stat(fullPath);

                results.push({
                    path: relativePath,
                    name: entry.name,
                    extension: ext,
                    size: stat.size,
                });
            }
        }
    } catch (err) {
        console.error(`Failed to scan directory ${dirPath}:`, err);
    }

    return results;
}
