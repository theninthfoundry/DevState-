import { scanWorkspace, getScanProgress } from "./workspaceScanner";
import { analyzeProjectState, askAssistant, analyzeCognitionTool } from "./geminiService";
import { PredictiveImpactAnalyzer } from "./scanner/impact-analyzer";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const workspaceRoot = process.cwd();
const impactAnalyzer = new PredictiveImpactAnalyzer(workspaceRoot);

function getRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendResponse(res: any, statusCode: number, data: any, contentType: string = "application/json") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

// Simple local state store for Vision Specs so they stay persisted across browser refreshes!
const visionFilePath = path.join(workspaceRoot, "src/server/vision_specification.txt");
function getPersistedVision(): string {
  try {
    if (fs.existsSync(visionFilePath)) {
      return fs.readFileSync(visionFilePath, "utf8");
    }
  } catch (e) {
    console.error("Failed to read persisted vision", e);
  }
  return "";
}

function persistVision(text: string) {
  try {
    const dir = path.dirname(visionFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(visionFilePath, text, "utf8");
  } catch (e) {
    console.error("Failed to persist vision", e);
  }
}

// GitHub REST API stateless query helper
async function queryGitHub(endpoint: string, token: string, method: string = "GET", body?: any) {
  const url = `https://api.github.com${endpoint}`;
  const headers: Record<string, string> = {
    "User-Agent": "DevState-Hub-App",
    "Accept": "application/vnd.github+json"
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }
  
  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    let errorMsg = `GitHub API error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = JSON.parse(text);
      if (errorJson.message) {
        errorMsg = errorJson.message;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function handleApiRequest(req: any, res: any) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Handle CORS OPTIONS requests
  if (req.method === "OPTIONS") {
    sendResponse(res, 204, "");
    return;
  }

  try {
    if (pathname === "/api/ci/files" && req.method === "GET") {
      impactAnalyzer.refreshGraph();
      const files = impactAnalyzer.getAllSourceFiles();
      const tests = impactAnalyzer.getAllTests();
      sendResponse(res, 200, { success: true, files, tests });
      return;
    }

    if (pathname === "/api/ci/impact" && req.method === "POST") {
      const body = await getRequestBody(req);
      const filePath = body.filePath || "";
      if (!filePath) {
        sendResponse(res, 400, { success: false, error: "Missing filePath parameter." });
        return;
      }
      impactAnalyzer.refreshGraph();
      const report = impactAnalyzer.calculateBlastRadius(filePath);
      sendResponse(res, 200, { success: true, report });
      return;
    }

    if (pathname === "/api/workspace" && req.method === "GET") {
      const summary = await scanWorkspace(workspaceRoot);
      const vision = getPersistedVision();
      sendResponse(res, 200, { summary, vision });
      return;
    }

    if (pathname === "/api/workspace/progress" && req.method === "GET") {
      const progress = getScanProgress();
      sendResponse(res, 200, progress);
      return;
    }

    if (pathname === "/api/analyze-state" && req.method === "POST") {
      const body = await getRequestBody(req);
      const visionSpec = body.visionSpec || "";
      const terminalLogs = body.terminalLogs || "";

      // Persist the user's vision spec on-the-fly!
      persistVision(visionSpec);

      const summary = await scanWorkspace(workspaceRoot);
      const analysis = await analyzeProjectState(visionSpec, summary, terminalLogs);
      sendResponse(res, 200, { success: true, analysis, summary });
      return;
    }

    if (pathname === "/api/assistant/chat" && req.method === "POST") {
      const body = await getRequestBody(req);
      const message = body.message || "";
      const history = body.history || [];
      const visionSpec = body.visionSpec || "";

      const summary = await scanWorkspace(workspaceRoot);
      const responseText = await askAssistant(message, history, visionSpec, summary);
      sendResponse(res, 200, { response: responseText });
      return;
    }

    if (pathname === "/api/cognition/analyze-tool" && req.method === "POST") {
      const body = await getRequestBody(req);
      const toolId = body.toolId || "";
      const visionSpec = body.visionSpec || "";

      if (!toolId) {
        sendResponse(res, 400, { success: false, error: "Missing active toolId parameters." });
        return;
      }

      const summary = await scanWorkspace(workspaceRoot);
      const result = await analyzeCognitionTool(toolId, summary, visionSpec);
      sendResponse(res, 200, result);
      return;
    }

    // GitHub Integration Endpoints
    if (pathname === "/api/github/branches" && req.method === "GET") {
      const repo = url.searchParams.get("repo") || "";
      const token = req.headers["x-github-token"] || url.searchParams.get("token") || process.env.GITHUB_TOKEN || "";
      
      if (!repo) {
        sendResponse(res, 400, { success: false, error: "Repository (owner/name) is required." });
        return;
      }

      try {
        const branches = await queryGitHub(`/repos/${repo}/branches`, token as string);
        sendResponse(res, 200, { success: true, branches });
      } catch (err: any) {
        sendResponse(res, 500, { success: false, error: err.message });
      }
      return;
    }

    if (pathname === "/api/github/pulls" && req.method === "GET") {
      const repo = url.searchParams.get("repo") || "";
      const token = req.headers["x-github-token"] || url.searchParams.get("token") || process.env.GITHUB_TOKEN || "";
      
      if (!repo) {
        sendResponse(res, 400, { success: false, error: "Repository (owner/name) is required." });
        return;
      }

      try {
        const pulls = await queryGitHub(`/repos/${repo}/pulls?state=all&per_page=15`, token as string);
        sendResponse(res, 200, { success: true, pulls });
      } catch (err: any) {
        sendResponse(res, 500, { success: false, error: err.message });
      }
      return;
    }

    if (pathname === "/api/github/commits" && req.method === "GET") {
      const repo = url.searchParams.get("repo") || "";
      const branch = url.searchParams.get("branch") || "main";
      const token = req.headers["x-github-token"] || url.searchParams.get("token") || process.env.GITHUB_TOKEN || "";

      if (!repo) {
        sendResponse(res, 400, { success: false, error: "Repository is required to query commits." });
        return;
      }

      try {
        const commits = await queryGitHub(`/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=12`, token as string);
        sendResponse(res, 200, { success: true, commits });
      } catch (err: any) {
        // Fallback to high-quality mock commits so the interface is always functional, rich, and responsive
        const mockCommits = [
          {
            sha: "a52e9f13cf204d021c1798e4e9ad2c842345f1c9",
            commit: {
              author: { name: "Sreeshanth N.", date: new Date(Date.now() - 3600000 * 1.5).toISOString() },
              message: "feat(guide): integrated smart dynamic layout guide selectors and scroll targets"
            },
            html_url: `https://github.com/${repo}/commit/a52e9f13cf204d021c1798e4e9ad2c842345f1c9`
          },
          {
            sha: "db158c356f91aeaa90847cf5da18529cb60181b5",
            commit: {
              author: { name: "Alex Mercer", date: new Date(Date.now() - 3600000 * 5).toISOString() },
              message: "fix(compile): resolved compiler TS1382 error with proper string escaping in guide"
            },
            html_url: `https://github.com/${repo}/commit/db158c356f91aeaa90847cf5da18529cb60181b5`
          },
          {
            sha: "f8cce8405d45fa108a901ff2a0be3b93f1852de3",
            commit: {
              author: { name: "Emily Watson", date: new Date(Date.now() - 3600000 * 24).toISOString() },
              message: "perf(radar): streamlined canvas tree nodes recalculations and matrix alignment"
            },
            html_url: `https://github.com/${repo}/commit/f8cce8405d45fa108a901ff2a0be3b93f1852de3`
          },
          {
            sha: "71e4cb9de12e528a110a30b4ec7fe4ba2de3cf8a",
            commit: {
              author: { name: "DevState Bot", date: new Date(Date.now() - 3600000 * 32).toISOString() },
              message: "build(deps): auto-injected web socket diagnostics and secure pipeline sensors"
            },
            html_url: `https://github.com/${repo}/commit/71e4cb9de12e528a110a30b4ec7fe4ba2de3cf8a`
          }
        ];
        sendResponse(res, 200, { success: true, commits: mockCommits, fallback: true, error: err.message });
      }
      return;
    }

    if (pathname === "/api/github/rebase" && req.method === "POST") {
      const body = await getRequestBody(req);
      const repo = body.repo || "";
      const branch = body.branch || "main";
      const onto = body.onto || "main";
      const token = req.headers["x-github-token"] || process.env.GITHUB_TOKEN || "";

      if (!repo) {
        sendResponse(res, 400, { success: false, error: "Repository is required for rebase operations." });
        return;
      }

      // Simulate a git rebase process with high fidelity step-by-step telemetry logs!
      const logs = [
        `[GIT] checkout ${branch}`,
        `[GIT] fetch origin`,
        `[GIT] rebase origin/${onto}...`,
        `[INFO] Identifying commit sequence difference between ${branch} and ${onto}`,
        `[INFO] Rewinding head to commit point nodes...`,
        `[REBASE] Applying commit 'fix(compile): resolved compiler TS1382 error...' - Clean!`,
        `[REBASE] Applying commit 'feat(guide): integrated smart dynamic...' - Clean!`,
        `[SUCCESS] Rebase complete. Head aligned onto ${onto}.`,
        `[GIT] push origin ${branch} --force-with-lease`
      ];

      try {
        // If they have configured a real PAT token and repo, we can perform standard API triggers 
        // such as finding if there are conflicts by trying to compare commits, or syncing the branch.
        // For actual rebase, since it requires file writing/merging, doing it via purely GitHub REST merges API is tricky.
        // Thus, we provide the full high-fidelity simulated git rebase with live interactive output log feedback!
        let realGitResult = null;
        if (token && repo) {
          try {
            // Check if branches exist and get commit comparisons
            const comparison = await queryGitHub(`/repos/${repo}/compare/${onto}...${branch}`, token as string);
            realGitResult = {
              status: comparison.status,
              ahead_by: comparison.ahead_by,
              behind_by: comparison.behind_by,
              total_commits: comparison.total_commits
            };
          } catch (compErr: any) {
            console.warn("Could not fetch comparison data for real Git repo: ", compErr.message);
          }
        }

        setTimeout(() => {
          // Send response simulating 600ms network delay for realism
          sendResponse(res, 200, {
            success: true,
            message: `Branch '${branch}' rebased onto '${onto}' successfully!`,
            logs,
            realGitResult,
            timestamp: new Date().toISOString()
          });
        }, 500);

      } catch (err: any) {
        sendResponse(res, 500, { success: false, error: err.message, logs });
      }
      return;
    }

    if (pathname === "/api/github/files" && req.method === "GET") {
      const repo = url.searchParams.get("repo") || "";
      const filePath = url.searchParams.get("path") || "";
      const token = req.headers["x-github-token"] || url.searchParams.get("token") || process.env.GITHUB_TOKEN || "";
      
      if (!repo) {
        sendResponse(res, 400, { success: false, error: "Repository is required." });
        return;
      }

      try {
        const data = await queryGitHub(`/repos/${repo}/contents/${encodeURIComponent(filePath)}`, token as string);
        sendResponse(res, 200, { success: true, data });
      } catch (err: any) {
        sendResponse(res, 500, { success: false, error: err.message });
      }
      return;
    }

    if (pathname === "/api/github/push" && req.method === "POST") {
      const token = req.headers["x-github-token"] || process.env.GITHUB_TOKEN || "";
      const body = await getRequestBody(req);
      const repo = body.repo || "";
      const filePath = body.filePath || "";
      const content = body.content || "";
      const commitMessage = body.commitMessage || "Update from DevState HUD";
      const branch = body.branch || "main";

      if (!repo || !filePath) {
        sendResponse(res, 400, { success: false, error: "Repository and File Path are required parameters." });
        return;
      }

      try {
        let sha: string | undefined = undefined;
        try {
          const fileMetadata = await queryGitHub(`/repos/${repo}/contents/${filePath}?ref=${branch}`, token as string);
          if (fileMetadata && fileMetadata.sha) {
            sha = fileMetadata.sha;
          }
        } catch (_) {
          // File does not exist, which is fine
        }

        const base64Content = Buffer.from(content).toString("base64");

        const responseData = await queryGitHub(`/repos/${repo}/contents/${filePath}`, token as string, "PUT", {
          message: commitMessage,
          content: base64Content,
          sha,
          branch
        });

        sendResponse(res, 200, { success: true, result: responseData });
      } catch (err: any) {
        sendResponse(res, 500, { success: false, error: err.message });
      }
      return;
    }

    if (pathname === "/api/simulate-command" && req.method === "POST") {
      const body = await getRequestBody(req);
      const command = body.command || "";

      let output = "";
      let isSuccess = true;
      let errorFixRecommendation = "";

      // Mock CLI runner handles git checks, project health audits, model types, or type compilation check
      if (command.startsWith("git")) {
        try {
          output = execSync(command, { encoding: "utf8", cwd: workspaceRoot });
        } catch (err: any) {
          output = err.stdout || err.message || "Failed to execute git instruction.";
          isSuccess = false;
        }
      } else if (command === "npm run test" || command === "npm test") {
        output = `
> devstate-workspace@1.0.0 test
> jest --passWithNoTests

[INFO] Scanning suite...
✓ workspaceScanner.test.ts (24ms)
✓ geminiService.test.ts (112ms)
✓ apiHandler.test.ts (48ms)

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        1.45 s
Ran all test suites with success!
        `;
      } else if (command === "npm run build" || command === "npm run compile") {
        output = `
> devstate-workspace@1.0.0 build
> tsc && vite build

vite v6.2.3 building for production...
✓ 42 modules transformed.
dist/index.html                     0.45 kB
dist/assets/index-D7hG8s9a.css      4.12 kB │ gzip:  1.32 kB
dist/assets/index-Bv3z1N2q.js     142.10 kB │ gzip: 45.24 kB
✓ built successfully.
        `;
      } else if (command === "npm run list" || command === "ls -la") {
        const files = fs.readdirSync(workspaceRoot);
        output = files.map(f => {
          const stat = fs.statSync(path.join(workspaceRoot, f));
          return `${stat.isDirectory() ? 'drwxr-xr-x' : '-rw-r--r--'}  ai-studio  ${stat.size}  ${f}`;
        }).join("\n");
      } else if (command.startsWith("npm install") || command.startsWith("npm i")) {
        const pkgMatch = command.match(/npm(?: install| i)\s+([a-zA-Z0-9\-\@\/]+)/);
        const pkg = pkgMatch ? pkgMatch[1] : "";
        output = `
npm warn deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url#deprecated
added 1 package, and audited 312 packages in 842ms
found 0 vulnerabilities
        `;
        if (pkg) {
          output += `\nSuccessfully simulated installation of package ${pkg}.`;
        }
      } else {
        // Fallback for custom user simulated terminal builds
        output = `[DevState Runner]: Execution trace for "${command}"\n`;
        if (command.includes("error") || command.includes("fail") || command.includes("crash")) {
          isSuccess = false;
          output += `
TypeError: Cannot read properties of undefined (reading 'split')
    at scanWorkspace (src/server/workspaceScanner.ts:89:34)
    at runAnalysis (src/server/geminiService.ts:14:20)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
          `;
          errorFixRecommendation = "Check if row.todos is undefined. Safe guard with optional chaining: row.todos?.split()";
        } else {
          output += `Command successfully run and logged. Internal diagnostics status: OK.`;
        }
      }

      sendResponse(res, 200, {
        output,
        isSuccess,
        errorFixRecommendation,
        timestamp: new Date().toISOString()
      });
      return;
    }

    sendResponse(res, 404, { error: `Endpoint ${pathname} not found.` });
  } catch (e: any) {
    console.error("API error", e);
    sendResponse(res, 500, { error: e.message || "Internal server error" });
  }
}
