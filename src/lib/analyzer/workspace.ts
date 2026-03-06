import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

export interface PackageInfo {
    name: string;         // e.g. "@myorg/utils"
    path: string;         // relative path from repo root, e.g. "packages/utils"
    version?: string;
    isRoot?: boolean;
    dependencies: string[]; // other package names this one depends on
}

export interface WorkspaceInfo {
    type: 'turborepo' | 'nx' | 'lerna' | 'pnpm' | 'npm' | 'yarn' | 'none';
    packages: PackageInfo[];
    rootName?: string;
}

/**
 * Detect monorepo workspace structure by reading config files.
 * Supports: Turborepo, Nx, Lerna, pnpm workspaces, npm/yarn workspaces.
 */
export async function detectWorkspaces(repoPath: string): Promise<WorkspaceInfo> {
    const normalizedPath = repoPath.replace(/\\/g, '/');

    // Try each detection strategy in order of specificity
    const detectors: Array<() => Promise<WorkspaceInfo | null>> = [
        () => detectTurborepo(normalizedPath),
        () => detectNx(normalizedPath),
        () => detectLerna(normalizedPath),
        () => detectPnpmWorkspaces(normalizedPath),
        () => detectNpmYarnWorkspaces(normalizedPath),
    ];

    for (const detect of detectors) {
        try {
            const result = await detect();
            if (result && result.packages.length > 0) {
                // Resolve internal cross-package dependencies
                await resolveCrossPackageDeps(result, normalizedPath);
                return result;
            }
        } catch (e) {
            console.warn('[Traceon] Workspace detection error:', e instanceof Error ? e.message : e);
        }
    }

    return { type: 'none', packages: [] };
}

/**
 * Turborepo detection — look for turbo.json at root
 */
async function detectTurborepo(repoPath: string): Promise<WorkspaceInfo | null> {
    try {
        await fs.access(path.join(repoPath, 'turbo.json'));
    } catch {
        return null;
    }

    // Turborepo uses npm/yarn/pnpm workspaces under the hood
    const baseInfo = await detectNpmYarnWorkspaces(repoPath) || await detectPnpmWorkspaces(repoPath);
    if (!baseInfo || baseInfo.packages.length === 0) return null;

    return { ...baseInfo, type: 'turborepo' };
}

/**
 * Nx detection — look for nx.json at root
 */
async function detectNx(repoPath: string): Promise<WorkspaceInfo | null> {
    let nxConfig: { projects?: Record<string, string> };
    try {
        const raw = await fs.readFile(path.join(repoPath, 'nx.json'), 'utf-8');
        nxConfig = JSON.parse(raw);
    } catch {
        return null;
    }

    const packages: PackageInfo[] = [];

    // Nx can define projects in nx.json or use workspace.json/project.json
    if (nxConfig.projects) {
        for (const [name, projPath] of Object.entries(nxConfig.projects)) {
            packages.push({
                name,
                path: typeof projPath === 'string' ? projPath : name,
                dependencies: [],
            });
        }
    }

    // Also scan for project.json files (Nx convention)
    if (packages.length === 0) {
        const projectJsonFiles = await fg('**/project.json', {
            cwd: repoPath,
            ignore: ['**/node_modules/**'],
            deep: 3,
        });

        for (const pjFile of projectJsonFiles) {
            try {
                const raw = await fs.readFile(path.join(repoPath, pjFile), 'utf-8');
                const proj = JSON.parse(raw);
                const projDir = path.dirname(pjFile).replace(/\\/g, '/');
                packages.push({
                    name: proj.name || path.basename(projDir),
                    path: projDir,
                    dependencies: [],
                });
            } catch { /* skip */ }
        }
    }

    // Fallback: also check workspaces in package.json
    if (packages.length === 0) {
        const wsInfo = await detectNpmYarnWorkspaces(repoPath);
        if (wsInfo) return { ...wsInfo, type: 'nx' };
    }

    if (packages.length === 0) return null;

    return { type: 'nx', packages };
}

/**
 * Lerna detection — look for lerna.json at root
 */
async function detectLerna(repoPath: string): Promise<WorkspaceInfo | null> {
    let lernaConfig: { packages?: string[] };
    try {
        const raw = await fs.readFile(path.join(repoPath, 'lerna.json'), 'utf-8');
        lernaConfig = JSON.parse(raw);
    } catch {
        return null;
    }

    const globs = lernaConfig.packages || ['packages/*'];
    const packages = await resolveWorkspaceGlobs(repoPath, globs);

    if (packages.length === 0) return null;
    return { type: 'lerna', packages };
}

/**
 * pnpm workspace detection — look for pnpm-workspace.yaml
 */
async function detectPnpmWorkspaces(repoPath: string): Promise<WorkspaceInfo | null> {
    let content: string;
    try {
        content = await fs.readFile(path.join(repoPath, 'pnpm-workspace.yaml'), 'utf-8');
    } catch {
        return null;
    }

    // Simple YAML parsing for the packages array (avoid heavy yaml dep)
    const globs: string[] = [];
    const lines = content.split('\n');
    let inPackages = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('packages:')) {
            inPackages = true;
            continue;
        }
        if (inPackages) {
            if (trimmed.startsWith('-')) {
                const glob = trimmed.replace(/^-\s*['"]?/, '').replace(/['"]?\s*$/, '');
                if (glob) globs.push(glob);
            } else if (trimmed && !trimmed.startsWith('#')) {
                break; // No longer in packages block
            }
        }
    }

    if (globs.length === 0) return null;
    const packages = await resolveWorkspaceGlobs(repoPath, globs);
    if (packages.length === 0) return null;

    return { type: 'pnpm', packages };
}

/**
 * npm/yarn workspace detection — look for "workspaces" in package.json
 */
async function detectNpmYarnWorkspaces(repoPath: string): Promise<WorkspaceInfo | null> {
    let pkg: { name?: string; workspaces?: string[] | { packages: string[] } };
    try {
        const raw = await fs.readFile(path.join(repoPath, 'package.json'), 'utf-8');
        pkg = JSON.parse(raw);
    } catch {
        return null;
    }

    if (!pkg.workspaces) return null;

    const globs = Array.isArray(pkg.workspaces)
        ? pkg.workspaces
        : pkg.workspaces.packages || [];

    if (globs.length === 0) return null;
    const packages = await resolveWorkspaceGlobs(repoPath, globs);
    if (packages.length === 0) return null;

    // Detect yarn via yarn.lock
    let type: WorkspaceInfo['type'] = 'npm';
    try {
        await fs.access(path.join(repoPath, 'yarn.lock'));
        type = 'yarn';
    } catch { /* npm */ }

    return { type, packages, rootName: pkg.name };
}

/**
 * Given glob patterns like ["packages/*", "apps/*"], find all directories
 * that contain a package.json and extract their name.
 */
async function resolveWorkspaceGlobs(repoPath: string, globs: string[]): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];
    const seen = new Set<string>();

    for (const glob of globs) {
        // Convert workspace globs to fast-glob patterns
        const pattern = glob.endsWith('/*') || glob.endsWith('/**')
            ? `${glob.replace(/\/\*\*?$/, '')}/*/package.json`
            : `${glob}/package.json`;

        const matches = await fg(pattern, {
            cwd: repoPath,
            ignore: ['**/node_modules/**'],
            absolute: false,
        });

        for (const match of matches) {
            const pkgDir = path.dirname(match).replace(/\\/g, '/');
            if (seen.has(pkgDir)) continue;
            seen.add(pkgDir);

            try {
                const raw = await fs.readFile(path.join(repoPath, match), 'utf-8');
                const pkgJson = JSON.parse(raw);
                packages.push({
                    name: pkgJson.name || path.basename(pkgDir),
                    path: pkgDir,
                    version: pkgJson.version,
                    dependencies: [],
                });
            } catch {
                packages.push({
                    name: path.basename(pkgDir),
                    path: pkgDir,
                    dependencies: [],
                });
            }
        }
    }

    return packages;
}

/**
 * Once packages are discovered, read each package.json to find
 * cross-references to sibling packages (internal deps).
 */
async function resolveCrossPackageDeps(info: WorkspaceInfo, repoPath: string): Promise<void> {
    const packageNames = new Set(info.packages.map(p => p.name));

    for (const pkg of info.packages) {
        try {
            const pkgJsonPath = path.join(repoPath, pkg.path, 'package.json');
            const raw = await fs.readFile(pkgJsonPath, 'utf-8');
            const pkgJson = JSON.parse(raw);

            const allDeps = {
                ...pkgJson.dependencies,
                ...pkgJson.devDependencies,
                ...pkgJson.peerDependencies,
            };

            for (const depName of Object.keys(allDeps)) {
                if (packageNames.has(depName)) {
                    pkg.dependencies.push(depName);
                }
            }
        } catch { /* skip */ }
    }
}
