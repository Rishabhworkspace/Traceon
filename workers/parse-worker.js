// Worker Thread script for CPU-intensive AST parsing
// This runs in a separate thread to avoid blocking the main event loop
/* eslint-disable @typescript-eslint/no-require-imports */

const { parentPort, workerData } = require('worker_threads');
const ts = require('typescript');
const fs = require('fs');

function parseFileContent(content, fileName) {
    const sourceFile = ts.createSourceFile(
        fileName,
        content,
        ts.ScriptTarget.Latest,
        true,
        fileName.endsWith('.tsx') || fileName.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const result = {
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        loc: content.split('\n').length,
    };

    function visit(node) {
        // 1. Imports
        if (ts.isImportDeclaration(node)) {
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                result.imports.push(node.moduleSpecifier.text);
            }
        }
        // Dynamic imports
        else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                result.imports.push(node.arguments[0].text);
            }
        }
        // 2. Exports
        else if (ts.isExportDeclaration(node)) {
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                result.exports.push(node.moduleSpecifier.text);
            }
        }
        else if (ts.isExportAssignment(node)) {
            result.exports.push('default');
        }

        const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
        const isExported = modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

        // 3. Classes
        if (ts.isClassDeclaration(node) && node.name) {
            if (isExported) result.exports.push(node.name.text);
            result.classes.push(node.name.text);
        }

        // 4. Functions
        if (ts.isFunctionDeclaration(node) && node.name) {
            if (isExported) result.exports.push(node.name.text);
            result.functions.push(node.name.text);
        }
        else if (ts.isVariableStatement(node) && isExported) {
            node.declarationList.declarations.forEach(decl => {
                if (ts.isIdentifier(decl.name)) {
                    result.exports.push(decl.name.text);
                    if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                        result.functions.push(decl.name.text);
                    }
                }
            });
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    result.imports = [...new Set(result.imports)];
    result.exports = [...new Set(result.exports)];
    result.classes = [...new Set(result.classes)];
    result.functions = [...new Set(result.functions)];

    return result;
}

// Process a batch of files sent from the main thread
// files: [{ fullPath, path, name, extension }]
const { files } = workerData;
const results = [];

for (const file of files) {
    try {
        const content = fs.readFileSync(file.fullPath, 'utf-8');
        const parsed = parseFileContent(content, file.name);
        results.push({
            path: file.path,
            name: file.name,
            extension: file.extension,
            parsed,
            error: null,
            loc: parsed.loc
        });
    } catch (err) {
        results.push({
            path: file.path,
            name: file.name,
            extension: file.extension,
            parsed: { imports: [], exports: [], functions: [], classes: [], loc: 0 },
            error: err.message,
            loc: 0
        });
    }
}

parentPort.postMessage(results);
