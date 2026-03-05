import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';

export interface ScannedFile {
    path: string;       // relative path from root
    name: string;       // file name
    extension: string;  // e.g., '.ts', '.js'
    size: number;
}

export async function scanDirectory(
    dirPath: string,
    basePath: string = dirPath
): Promise<ScannedFile[]> {
    const results: ScannedFile[] = [];

    try {
        // Replace absolute backslashes for fg if running on Windows
        const normalizedDir = dirPath.replace(/\\/g, '/');

        // Find all code-like files, ignoring standard massive directories
        const entries = await fg(
            [
                '**/*.{js,jsx,ts,tsx,json,md,css,scss,mjs,cjs,html,vue,svelte,astro,svg}',
                '**/.env*'
            ],
            {
                cwd: normalizedDir,
                ignore: [
                    '**/node_modules/**',
                    '**/.git/**',
                    '**/dist/**',
                    '**/build/**',
                    '**/.next/**',
                    '**/coverage/**',
                    '**/.vercel/**',
                    '**/out/**',
                    '**/package-lock.json',
                    '**/yarn.lock',
                    '**/pnpm-lock.yaml'
                ],
                dot: true,
                stats: true,
                absolute: true
            }
        );

        for (const entry of entries) {
            const relativePath = path.relative(basePath, entry.path).replace(/\\/g, '/');
            results.push({
                path: relativePath,
                name: entry.name,
                extension: path.extname(entry.name),
                size: entry.stats?.size || 0,
            });
        }
    } catch (err) {
        console.error(`Failed to scan directory ${dirPath}:`, err);
    }

    return results;
}
