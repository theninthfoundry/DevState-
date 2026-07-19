import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

export interface ImpactReport {
  modifiedFile: string;
  affectedFiles: string[];
  testsToRun: string[];
  computeSavedPct: number;
}

export class PredictiveImpactAnalyzer {
  private workspaceRoot: string;
  private importMap: Map<string, string[]> = new Map(); // Absolute file path -> Absolute import paths
  private reverseImportMap: Map<string, string[]> = new Map(); // Absolute import path -> Absolute consumer paths
  private allTests: string[] = [];
  private allFiles: string[] = [];

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
    this.refreshGraph();
  }

  /**
   * Scans the workspace, resolve modules, and builds graph tables
   */
  public refreshGraph(): void {
    this.importMap.clear();
    this.reverseImportMap.clear();
    this.allTests = [];
    this.allFiles = [];

    // Helper to walk directory and index all files recursively
    const walk = (dir: string) => {
      let files: string[] = [];
      try {
        files = fs.readdirSync(dir);
      } catch (err) {
        return;
      }

      for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat: fs.Stats;
        try {
          stat = fs.statSync(fullPath);
        } catch (_) {
          continue;
        }

        if (stat.isDirectory()) {
          if (
            file !== 'node_modules' &&
            file !== '.git' &&
            file !== 'dist' &&
            file !== '.next' &&
            file !== '.cache'
          ) {
            walk(fullPath);
          }
        } else {
          const ext = path.extname(file);
          if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            const normalized = path.resolve(fullPath);
            this.allFiles.push(normalized);

            if (file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.spec.ts') || file.endsWith('.spec.tsx')) {
              this.allTests.push(normalized);
            }
          }
        }
      }
    };

    walk(this.workspaceRoot);

    // Parse all indexed files for their resolved import paths
    for (const file of this.allFiles) {
      const imports = this.getFileImports(file);
      const resolvedImports: string[] = [];

      for (const imp of imports) {
        const resolved = this.resolveImportPath(file, imp);
        if (resolved) {
          resolvedImports.push(resolved);
          
          // Populate reverse mapping on the fly
          const dependents = this.reverseImportMap.get(resolved) || [];
          dependents.push(file);
          this.reverseImportMap.set(resolved, dependents);
        }
      }
      this.importMap.set(file, resolvedImports);
    }
  }

  /**
   * Extract raw imports from a file using AST parser
   */
  private getFileImports(filePath: string): string[] {
    const imports: string[] = [];
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const traverse = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          const specifier = node.moduleSpecifier;
          if (specifier && ts.isStringLiteral(specifier)) {
            imports.push(specifier.text);
          }
        } else if (ts.isExportDeclaration(node)) {
          const specifier = node.moduleSpecifier;
          if (specifier && ts.isStringLiteral(specifier)) {
            imports.push(specifier.text);
          }
        }
        ts.forEachChild(node, traverse);
      };

      traverse(sourceFile);
    } catch (_) {
      // Return empty array on read errors or parsing failures
    }
    return imports;
  }

  /**
   * Resolves import strings (e.g. './MyComponent' or '@/components/MyComponent') to real file paths
   */
  private resolveImportPath(currentFile: string, importStr: string): string | null {
    const currentDir = path.dirname(currentFile);
    let targetPath = '';

    if (importStr.startsWith('.')) {
      // Relative import
      targetPath = path.resolve(currentDir, importStr);
    } else if (importStr.startsWith('@/')) {
      // Alias resolved to root /src/
      targetPath = path.resolve(this.workspaceRoot, 'src', importStr.slice(2));
    } else {
      // Absolute import or node_modules (which we don't trace in reverse backends)
      return null;
    }

    // Try finding files with common extensions
    const extensions = ['', '.tsx', '.ts', '.jsx', '.js'];
    for (const ext of extensions) {
      const fullPath = targetPath + ext;
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return path.resolve(fullPath);
      }
    }

    // Checking if it's an index import in a target directory
    for (const ext of extensions) {
      const indexPath = path.join(targetPath, 'index' + ext);
      if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
        return path.resolve(indexPath);
      }
    }

    return null;
  }

  /**
   * Retrieves all test files configured in the workspace
   */
  public getAllTests(): string[] {
    return this.allTests.map(t => path.relative(this.workspaceRoot, t));
  }

  /**
   * Retrieves all source files indexable in the workspace
   */
  public getAllSourceFiles(): string[] {
    return this.allFiles.map(f => path.relative(this.workspaceRoot, f));
  }

  /**
   * Traces reverse dependency trees to calculate blast radius impact reports
   */
  public calculateBlastRadius(changedRelativePath: string): ImpactReport {
    const changedFileAbsolute = path.resolve(this.workspaceRoot, changedRelativePath);
    const affected: Set<string> = new Set();
    const testsToRun: Set<string> = new Set();
    const visited: Set<string> = new Set();

    const trace = (curr: string) => {
      if (visited.has(curr)) return;
      visited.add(curr);

      // Get all modules consuming this file (dependents)
      const consumers = this.reverseImportMap.get(curr) || [];
      for (const consumer of consumers) {
        affected.add(consumer);
        
        // If the consumer is a test, mark to be run
        if (this.allTests.includes(consumer)) {
          testsToRun.add(consumer);
        }
        
        // Recursively trace who consumes the consumer
        trace(consumer);
      }
    };

    trace(changedFileAbsolute);

    const totalTests = this.allTests.length;
    // Save metric calculation
    const testsDelta = totalTests - testsToRun.size;
    const computeSavedPct = totalTests > 0 
      ? Math.round((testsDelta / totalTests) * 100) 
      : 100;

    return {
      modifiedFile: changedRelativePath,
      affectedFiles: Array.from(affected).map(f => path.relative(this.workspaceRoot, f)),
      testsToRun: Array.from(testsToRun).map(f => path.relative(this.workspaceRoot, f)),
      computeSavedPct,
    };
  }
}
