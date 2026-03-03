import * as ts from 'typescript';

export interface ParseResult {
    imports: string[];
    exports: string[];
    functions: string[];
    classes: string[];
    loc: number;
}

export function parseFileContent(content: string, fileName: string): ParseResult {
    // Use TS Compiler API to create a SourceFile AST
    const sourceFile = ts.createSourceFile(
        fileName,
        content,
        ts.ScriptTarget.Latest,
        true, // setParentNodes
        fileName.endsWith('.tsx') || fileName.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const result: ParseResult = {
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        loc: content.split('\n').length,
    };

    // Traversal function
    function visit(node: ts.Node) {
        // 1. Imports
        if (ts.isImportDeclaration(node)) {
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                result.imports.push(node.moduleSpecifier.text);
            }
        }
        // Dynamic imports
        else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                result.imports.push((node.arguments[0] as ts.StringLiteral).text);
            }
        }
        // 2. Exports
        else if (ts.isExportDeclaration(node)) {
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                // e.g. export * from 'module'
                result.exports.push(node.moduleSpecifier.text);
            }
        }
        else if (ts.isExportAssignment(node)) {
            // default exports
            result.exports.push('default');
        }

        // Check modifiers for export keyword
        const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
        const isExported = modifiers?.some((m: ts.Modifier) => m.kind === ts.SyntaxKind.ExportKeyword);

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
        // Arrow functions assigned to variables
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

    // Filter out duplicates
    result.imports = [...new Set(result.imports)];
    result.exports = [...new Set(result.exports)];
    result.classes = [...new Set(result.classes)];
    result.functions = [...new Set(result.functions)];

    return result;
}
