import * as fs from 'fs';
import * as path from 'path';
import { analyzeFile } from './scanner/ast-parser';

export interface PhysicalFile {
  relativePath: string;
  size: number;
  todos: { line: number; text: string }[];
  imports: string[];
  envVarsUsed: string[];
  complexity?: number;
  group?: 'service' | 'ui' | 'api' | 'config';
}

export interface WorkspaceSummary {
  files: PhysicalFile[];
  dependencies: string[];
  devDependencies: string[];
  missingDeps: string[];
  missingConfigs: string[];
  todoCount: number;
}

export interface FileInfo {
  relPath: string;
  stat: fs.Stats;
}

export interface ScanProgress {
  status: 'idle' | 'scanning' | 'completed' | 'failed';
  totalFiles: number;
  scannedFiles: number;
  percentage: number;
}

// Module-level progress tracking
let activeProgress: ScanProgress = {
  status: 'idle',
  totalFiles: 0,
  scannedFiles: 0,
  percentage: 0,
};

export function getScanProgress(): ScanProgress {
  return activeProgress;
}

// Single-pass listing of files returning stats immediately to save duplicate system calls
// Optimized with fs.promises to prevent blocking the Node.js event loop during directory walks
async function getFilesRecursive(dir: string, baseDir: string = dir): Promise<FileInfo[]> {
  const results: FileInfo[] = [];
  try {
    try {
      await fs.promises.access(dir);
    } catch {
      return results;
    }

    const list = await fs.promises.readdir(dir);
    
    // Process directory contents in parallel
    const promises = list.map(async (file) => {
      const fullPath = path.join(dir, file);
      let stat: fs.Stats;
      try {
        stat = await fs.promises.stat(fullPath);
      } catch (err) {
        return; // skip if file is locked or missing permissions
      }
      const relPath = path.relative(baseDir, fullPath);

      // Skip common binaries/directories early
      if (
        file === 'node_modules' ||
        file === '.git' ||
        file === 'dist' ||
        file === '.next' ||
        file === '.cache' ||
        relPath.startsWith('node_modules' + path.sep) ||
        relPath.startsWith('.git' + path.sep) ||
        relPath.startsWith('dist' + path.sep) ||
        relPath === 'node_modules' ||
        relPath === '.git' ||
        relPath === 'dist'
      ) {
        return;
      }

      if (stat && stat.isDirectory()) {
        const subFiles = await getFilesRecursive(fullPath, baseDir);
        results.push(...subFiles);
      } else {
        results.push({ relPath, stat });
      }
    });

    await Promise.all(promises);
  } catch (e) {
    console.error('Error reading dir asynchronously', dir, e);
  }
  return results;
}

interface FileCacheEntry {
  mtimeMs: number;
  size: number;
  data: PhysicalFile;
}

const fileCache = new Map<string, FileCacheEntry>();

let lastScanTime = 0;
let lastSummary: WorkspaceSummary | null = null;
let fileEditEventDetected = false;
let watcherInitialized = false;

let fileChangeCallback: ((filename: string) => void) | null = null;
export function onWorkspaceFileChange(callback: (filename: string) => void) {
  fileChangeCallback = callback;
}

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
        if (fileChangeCallback) {
          fileChangeCallback(filename);
        }
      }
    });
  } catch (err) {
    console.warn("fs.watch recursive bypass active; using timer TTL.", err);
  }
}

// Main workspace scanner refactored with fs.promises to be async and track progress
export async function scanWorkspace(
  workspaceRoot: string,
  onProgress?: (scanned: number, total: number) => void
): Promise<WorkspaceSummary> {
  initWatcher(workspaceRoot);

  const now = Date.now();
  if (lastSummary && !fileEditEventDetected && (now - lastScanTime < 10000)) {
    // Set progress to finished instantly if serving from TTL cache
    activeProgress = {
      status: 'completed',
      totalFiles: lastSummary.files.length,
      scannedFiles: lastSummary.files.length,
      percentage: 100,
    };
    if (onProgress) onProgress(lastSummary.files.length, lastSummary.files.length);
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
    activeProgress = {
      status: 'scanning',
      totalFiles: 0,
      scannedFiles: 0,
      percentage: 0,
    };

    // 1. Read package.json for official dependencies asynchronously
    const packageJsonPath = path.join(workspaceRoot, 'package.json');
    let packageDeps: string[] = [];
    let packageDevDeps: string[] = [];
    
    let hasPackageJson = false;
    try {
      await fs.promises.access(packageJsonPath);
      hasPackageJson = true;
    } catch {}

    if (hasPackageJson) {
      const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf8');
      const content = JSON.parse(packageJsonContent);
      summary.dependencies = Object.keys(content.dependencies || {});
      summary.devDependencies = Object.keys(content.devDependencies || {});
      packageDeps = summary.dependencies;
      packageDevDeps = summary.devDependencies;
    }

    // 2. Read .env.example for configured environment variables asynchronously
    const envExamplePath = path.join(workspaceRoot, '.env.example');
    const exampleEnvKeys = new Set<string>();
    
    let hasEnvExample = false;
    try {
      await fs.promises.access(envExamplePath);
      hasEnvExample = true;
    } catch {}

    if (hasEnvExample) {
      const content = await fs.promises.readFile(envExamplePath, 'utf8');
      const matches = content.matchAll(/^\s*([A-Z0-9_]+)\s*=/gm);
      for (const m of matches) {
        if (m[1]) exampleEnvKeys.add(m[1]);
      }
    }

    // 3. Scan all project files recursively with single stat pass
    const filesWithStats = await getFilesRecursive(workspaceRoot);
    const totalFilesCount = filesWithStats.length;
    
    activeProgress.totalFiles = totalFilesCount;
    if (onProgress) onProgress(0, totalFilesCount);

    const allDeclaredImports = new Set<string>();
    const allAccessedEnvVars = new Set<string>();

    let scannedCount = 0;

    for (const { relPath, stat } of filesWithStats) {
      const fullPath = path.join(workspaceRoot, relPath);
      const fileExt = path.extname(relPath);
      const isSourceCode = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].includes(fileExt);

      // Try checking in-memory cache
      const cached = fileCache.get(relPath);
      if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
        summary.files.push(cached.data);
        cached.data.imports.forEach(imp => allDeclaredImports.add(imp));
        cached.data.envVarsUsed.forEach(ev => allAccessedEnvVars.add(ev));
        summary.todoCount += cached.data.todos.length;
        
        // Update progress
        scannedCount++;
        const pct = totalFilesCount > 0 ? Math.round((scannedCount / totalFilesCount) * 100) : 100;
        activeProgress.scannedFiles = scannedCount;
        activeProgress.percentage = pct;
        if (onProgress) onProgress(scannedCount, totalFilesCount);
        continue;
      }

      // Read & Analyze
      const fileTodos: { line: number; text: string }[] = [];
      const fileImports: string[] = [];
      const fileEnvVars: string[] = [];
      let complexity = 0;
      let group: 'service' | 'ui' | 'api' | 'config' = 'config';

      // Assign groups
      if (relPath.includes('src/components') || relPath.includes('src/store') || relPath.includes('src/hooks') || relPath.endsWith('App.tsx') || relPath.endsWith('main.tsx')) {
        group = 'ui';
      } else if (relPath.includes('server/') || relPath.endsWith('server.ts') || relPath.includes('apiHandler')) {
        group = 'service';
      } else if (relPath.includes('/api/')) {
        group = 'api';
      } else {
        group = 'config';
      }

      const isTSorJS = ['.ts', '.tsx', '.js', '.jsx'].includes(fileExt);

      if (isSourceCode && stat.size < 1000 * 1000) { // skip very large files for safety
        if (isTSorJS) {
          try {
            const astResult = analyzeFile(fullPath);
            complexity = astResult.complexity;
            
            astResult.imports.forEach(imp => {
              if (!imp.startsWith('.')) {
                const parts = imp.split('/');
                const rootPkg = parts[0].startsWith('@') && parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
                fileImports.push(rootPkg);
                allDeclaredImports.add(rootPkg);
              }
            });

            astResult.todos.forEach((todoText, idx) => {
              fileTodos.push({
                line: idx + 1,
                text: 'TODO: ' + todoText
              });
              summary.todoCount++;
            });
          } catch (e) {
            console.error(`AST analysis failed for ${relPath}, falling back:`, e);
          }
        } else {
          const fileContent = await fs.promises.readFile(fullPath, 'utf8');
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
              if (!importPath.startsWith('.')) {
                const parts = importPath.split('/');
                const rootPkg = parts[0].startsWith('@') && parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
                fileImports.push(rootPkg);
                allDeclaredImports.add(rootPkg);
              }
            }
          });
        }

        // Always scan for environmental variables in file
        try {
          const fileContent = await fs.promises.readFile(fullPath, 'utf8');
          const envMatches = fileContent.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)/g);
          for (const ev of envMatches) {
            if (ev[1]) {
              fileEnvVars.push(ev[1]);
              allAccessedEnvVars.add(ev[1]);
            }
          }
        } catch (_) {}
      }

      const physicalFileData: PhysicalFile = {
        relativePath: relPath,
        size: stat.size,
        todos: fileTodos,
        imports: [...new Set(fileImports)],
        envVarsUsed: [...new Set(fileEnvVars)],
        complexity,
        group
      };

      summary.files.push(physicalFileData);

      // Save to cache
      fileCache.set(relPath, {
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        data: physicalFileData,
      });

      // Update progress
      scannedCount++;
      const pct = totalFilesCount > 0 ? Math.round((scannedCount / totalFilesCount) * 100) : 100;
      activeProgress.scannedFiles = scannedCount;
      activeProgress.percentage = pct;
      if (onProgress) onProgress(scannedCount, totalFilesCount);
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

    activeProgress.status = 'completed';
    activeProgress.percentage = 100;

  } catch (err) {
    console.error('Failed to complete workspace scan:', err);
    activeProgress.status = 'failed';
  }

  fileEditEventDetected = false;
  lastScanTime = Date.now();
  lastSummary = summary;
  return summary;
}
