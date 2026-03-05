import * as ts from 'typescript';

export interface ParseResult {
    imports: string[];
    exports: string[];
    functions: string[];
    classes: string[];
    loc: number;
}

export function parseFileContent(content: string, fileName: string): ParseResult {
    const result: ParseResult = {
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        loc: content.split('\n').length,
    };

    if (fileName.endsWith('.html')) {
        // Parse HTML for scripts and links
        const scriptSrcRegex = /<script[^>]+src=["']([^"']+)["']/gi;
        const linkHrefRegex = /<link[^>]+href=["']([^"']+)["']/gi;

        let match;
        while ((match = scriptSrcRegex.exec(content)) !== null) {
            result.imports.push(match[1]);
        }
        while ((match = linkHrefRegex.exec(content)) !== null) {
            // Include css links
            if (match[0].toLowerCase().includes('rel="stylesheet"') || match[1].endsWith('.css')) {
                result.imports.push(match[1]);
            }
        }
        return result;
    }

    if (fileName.endsWith('.css') || fileName.endsWith('.scss')) {
        // Parse CSS for @import
        const importRegex = /@import\s+(?:url\()?["']?([^"'\)]+)["']?\)?/gi;

        let match;
        while ((match = importRegex.exec(content)) !== null) {
            result.imports.push(match[1]);
        }
        return result;
    }

    let parseContent = content;

    // For Single File Components (Vue, Svelte), extract the <script> blocks 
    // to feed into the TypeScript AST parser.
    if (fileName.endsWith('.vue') || fileName.endsWith('.svelte')) {
        let scriptContent = '';
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = scriptRegex.exec(content)) !== null) {
            scriptContent += match[1] + '\n';
        }
        parseContent = scriptContent;
    }

    // For Astro, extract frontmatter --- ... --- and any <script> tags
    if (fileName.endsWith('.astro')) {
        let scriptContent = '';
        const frontmatterRegex = /^---[\r\n]+([\s\S]*?)[\r\n]+---/m;
        const fmMatch = frontmatterRegex.exec(content);
        if (fmMatch) {
            scriptContent += fmMatch[1] + '\n';
        }

        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;
        while ((scriptMatch = scriptRegex.exec(content)) !== null) {
            scriptContent += scriptMatch[1] + '\n';
        }
        parseContent = scriptContent;
    }

    // Use TS Compiler API to create a SourceFile AST for JS/TS (and extracted scripts)
    const sourceFile = ts.createSourceFile(
        fileName,
        parseContent,
        ts.ScriptTarget.Latest,
        true, // setParentNodes
        fileName.endsWith('.tsx') || fileName.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    // Traversal function
    function visit(node: ts.Node) {
        // --- 1. ES6 Imports: import { x } from 'y' OR import 'global.css' ---
        if (ts.isImportDeclaration(node)) {
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                result.imports.push(node.moduleSpecifier.text);
            }
        }

        // --- 2. Dynamic Imports: import('y') ---
        else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                result.imports.push((node.arguments[0] as ts.StringLiteral).text);
            }
        }

        // --- 3. CommonJS Imports: require('y') (can be anywhere, even deeply nested) ---
        else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                result.imports.push((node.arguments[0] as ts.StringLiteral).text);
            }
        }

        // --- 4. ES6 Exports (including Re-exports) ---
        else if (ts.isExportDeclaration(node)) {
            // Re-exports: export { x } from 'y' OR export * from 'y'
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                result.imports.push(node.moduleSpecifier.text);
            }

            // Track what is actually being exported
            if (node.exportClause) {
                if (ts.isNamedExports(node.exportClause)) {
                    node.exportClause.elements.forEach(el => {
                        result.exports.push(el.name.text);
                    });
                } else if (ts.isNamespaceExport(node.exportClause)) {
                    result.exports.push(node.exportClause.name.text);
                }
            } else {
                result.exports.push('*');
            }
        }

        // --- 5. Export Assignment (export default x) ---
        else if (ts.isExportAssignment(node)) {
            result.exports.push('default');
        }

        // --- Modifiers Check for inline exports (export const/function/class) ---
        const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
        let isExported = false;
        let isDefault = false;

        if (modifiers) {
            for (const mod of modifiers) {
                if (mod.kind === ts.SyntaxKind.ExportKeyword) isExported = true;
                if (mod.kind === ts.SyntaxKind.DefaultKeyword) isDefault = true;
            }
        }

        // --- 6. Classes ---
        if (ts.isClassDeclaration(node) && node.name) {
            if (isExported) result.exports.push(isDefault ? 'default' : node.name.text);
            result.classes.push(node.name.text);
        }

        // --- 7. Functions ---
        else if (ts.isFunctionDeclaration(node) && node.name) {
            if (isExported) result.exports.push(isDefault ? 'default' : node.name.text);
            result.functions.push(node.name.text);
        }

        // --- 8. Variable Declarations (const x = ..., arrow functions, etc) ---
        else if (ts.isVariableStatement(node)) {
            if (isExported) {
                node.declarationList.declarations.forEach(decl => {
                    if (ts.isIdentifier(decl.name)) {
                        result.exports.push(decl.name.text);
                        // Also check if it's an arrow function
                        if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                            result.functions.push(decl.name.text);
                        }
                    }
                });
            } else {
                // If it's not exported, still track if it's a top-level arrow function (just for metrics)
                node.declarationList.declarations.forEach(decl => {
                    if (ts.isIdentifier(decl.name)) {
                        if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                            result.functions.push(decl.name.text);
                        }
                    }
                });
            }
        }

        // --- 9. Type Aliases and Interfaces ---
        else if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name) {
            if (isExported) result.exports.push(isDefault ? 'default' : node.name.text);
        }

        // --- 10. CommonJS Exports: module.exports = ... OR exports.foo = ... ---
        else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const left = node.left;
            if (ts.isPropertyAccessExpression(left)) {
                if (ts.isIdentifier(left.expression) && left.expression.text === 'module' && left.name.text === 'exports') {
                    result.exports.push('default');
                } else if (ts.isIdentifier(left.expression) && left.expression.text === 'exports') {
                    result.exports.push(left.name.text);
                }
            }
        }

        // Traverse children
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Filter out duplicates
    result.imports = [...new Set(result.imports)];
    result.exports = [...new Set(result.exports)];
    result.classes = [...new Set(result.classes)];
    result.functions = [...new Set(result.functions)];

    return result;
}
