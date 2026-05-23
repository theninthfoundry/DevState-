import * as fs from 'fs';
import * as path from 'path';

export interface PhysicalFile {
  relativePath: string;
  size: number;
  todos: { line: number; text: string }[];
  imports: string[];
  envVarsUsed: string[];
}

export interface WorkspaceSummary {
  files: PhysicalFile[];
  dependencies: string[];
  devDependencies: string[];
  missingDeps: string[];
  missingConfigs: string[];
  todoCount: number;
}

// Simple recursive helper to list all files excluding common bulk patterns
function getFilesRecursive(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  try {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      const relPath = path.relative(baseDir, fullPath);

      // Skip common binaries/directories
      if (
        file === 'node_modules' ||
        file === '.git' ||
        file === 'dist' ||
        file === '.next' ||
        file === '.cache' ||
        relPath.startsWith('node_modules') ||
        relPath.startsWith('.git') ||
        relPath.startsWith('dist')
      ) {
        continue;
      }

      if (stat && stat.isDirectory()) {
         results.push(...getFilesRecursive(fullPath, baseDir));
      } else {
         results.push(relPath);
      }
    }
  } catch (e) {
    console.error('Error reading dir', dir, e);
  }
  return results;
}

let lastScanTime = 0;
let lastSummary: WorkspaceSummary | null = null;
let fileEditEventDetected = false;
let watcherInitialized = false;

function initWatcher(workspaceRoot: string) {
  if (watcherInitialized) return;
  watcherInitialized = true;
  try {
    fs.watch(workspaceRoot, { recursive: true }, (eventType, filename) => {
      if (filename) {
        if (
          filename.includes('node_modules') ||
          filename.includes('.git') ||
          filename.includes('dist') ||
          filename.includes('.next') ||
          filename.includes('.cache')
        ) {
          return;
        }
        fileEditEventDetected = true;
      }
    });
  } catch (err) {
    console.warn("fs.watch recursive bypass active; using timer TTL.", err);
  }
}

export function scanWorkspace(workspaceRoot: string): WorkspaceSummary {
  initWatcher(workspaceRoot);

  const now = Date.now();
  if (lastSummary && !fileEditEventDetected && (now - lastScanTime < 10000)) {
    return lastSummary;
  }

  const summary: WorkspaceSummary = {
    files: [],
    dependencies: [],
    devDependencies: [],
    missingDeps: [],
    missingConfigs: [],
    todoCount: 0,
  };

  try {
    // 1. Read package.json for official dependencies
    const packageJsonPath = path.join(workspaceRoot, 'package.json');
    let packageDeps: string[] = [];
    let packageDevDeps: string[] = [];
    if (fs.existsSync(packageJsonPath)) {
      const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      summary.dependencies = Object.keys(content.dependencies || {});
      summary.devDependencies = Object.keys(content.devDependencies || {});
      packageDeps = summary.dependencies;
      packageDevDeps = summary.devDependencies;
    }

    // 2. Read .env.example for configured environment variables
    const envExamplePath = path.join(workspaceRoot, '.env.example');
    const exampleEnvKeys = new Set<string>();
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      const matches = content.matchAll(/^\s*([A-Z0-9_]+)\s*=/gm);
      for (const m of matches) {
        if (m[1]) exampleEnvKeys.add(m[1]);
      }
    }

    // 3. Scan all project files recursively
    const relativeFiles = getFilesRecursive(workspaceRoot);
    const allDeclaredImports = new Set<string>();
    const allAccessedEnvVars = new Set<string>();

    for (const relFile of relativeFiles) {
      const fullPath = path.join(workspaceRoot, relFile);
      const stat = fs.statSync(fullPath);
      const fileExt = path.extname(relFile);

      // We only inspect code files for code-level analysis
      const isSourceCode = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].includes(fileExt);
      const fileTodos: { line: number; text: string }[] = [];
      const fileImports: string[] = [];
      const fileEnvVars: string[] = [];

      if (isSourceCode && stat.size < 1000 * 1000) { // skip very large files for safety
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const lines = fileContent.split('\n');

        lines.forEach((lineText, idx) => {
          const lineNum = idx + 1;

          // Search for TODO comments
          const todoMatch = lineText.match(/(?:\/\/|\/\*|\*|\#)\s*(TODO|FIXME|MOCK):\s*(.*)/i);
          if (todoMatch) {
            fileTodos.push({
              line: lineNum,
              text: todoMatch[1] + ': ' + todoMatch[2].trim(),
            });
            summary.todoCount++;
          }

          // Search for TS/JS imports (basic regex matching)
          const importMatch = lineText.match(/import\s+(?:.*from\s+)?['"]([^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            // Filter out relative imports
            if (!importPath.startsWith('.')) {
              // Strip sub-paths (e.g., 'react-dom/client' -> 'react-dom')
              const parts = importPath.split('/');
              const rootPkg = parts[0].startsWith('@') && parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
              fileImports.push(rootPkg);
              allDeclaredImports.add(rootPkg);
            }
          }

          // Search for process.env or import.meta.env usage
          const envMatches = lineText.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)/g);
          for (const ev of envMatches) {
            if (ev[1]) {
              fileEnvVars.push(ev[1]);
              allAccessedEnvVars.add(ev[1]);
            }
          }
        });
      }

      summary.files.push({
        relativePath: relFile,
        size: stat.size,
        todos: fileTodos,
        imports: [...new Set(fileImports)],
        envVarsUsed: [...new Set(fileEnvVars)],
      });
    }

    // Identify missing dependencies (e.g., imported in code but not listed in package.json)
    const officialDeps = new Set([...packageDeps, ...packageDevDeps, 'path', 'fs', 'child_process', 'crypto', 'events', 'http', 'https', 'os', 'stream', 'util', 'url']);
    for (const imp of allDeclaredImports) {
      if (!officialDeps.has(imp) && !imp.startsWith('@/')) {
        summary.missingDeps.push(imp);
      }
    }

    // Identify missing environmental configurations (e.g., accessed in code but not in .env.example)
    for (const envKey of allAccessedEnvVars) {
      if (!exampleEnvKeys.has(envKey)) {
        summary.missingConfigs.push(envKey);
      }
    }

  } catch (err) {
    console.error('Failed to complete workspace scan:', err);
  }

  fileEditEventDetected = false;
  lastScanTime = Date.now();
  lastSummary = summary;
  return summary;
}
