import * as ts from 'typescript';
import { readFileSync } from 'fs';

export interface ASTResult {
  imports: string[];
  complexity: number;
  todos: string[];
}

export const analyzeFile = (filePath: string): ASTResult => {
  const sourceCode = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const imports: string[] = [];
  const todos: string[] = [];
  let branchingFactor = 0;

  const traverse = (node: ts.Node) => {
    // Extract Dependencies (Imports)
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        imports.push(moduleSpecifier.text);
      }
    }

    // Measure Cognitive Load (Branching)
    if (
      ts.isIfStatement(node) || 
      ts.isSwitchStatement(node) || 
      ts.isConditionalExpression(node)
    ) {
      branchingFactor++;
    }

    ts.forEachChild(node, traverse);
  };

  traverse(sourceFile);

  // Extract TODOs via fast regex (faster than full AST comment parsing)
  const commentRegex = /\/\/\s*(TODO|FIXME|HACK):\s*(.*)/gi;
  let match;
  while ((match = commentRegex.exec(sourceCode)) !== null) {
    todos.push(match[2].trim());
  }

  return {
    imports,
    complexity: branchingFactor,
    todos
  };
};
