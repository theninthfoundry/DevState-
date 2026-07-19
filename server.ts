import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API constraints route
  app.post("/api/architecture", async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      res.json({ text, chunks });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate architecture" });
    }
  });

  // Global API Router fallback
  app.all("/api/*all", async (req, res, next) => {
    try {
      const { handleApiRequest } = await import("./src/server/apiHandler");
      await handleApiRequest(req, res);
    } catch (e) {
      next(e);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const { TelemetryHub } = await import("./src/server/gateway/websocket-hub");
  const hub = new TelemetryHub(httpServer);

  const { onWorkspaceFileChange, scanWorkspace } = await import("./src/server/workspaceScanner");
  
  onWorkspaceFileChange(async (filename) => {
    console.log(`[DevState] File changed on disk: ${filename}`);
    try {
      const summary = await scanWorkspace(path.resolve('.'));
      hub.dispatch('GRAPH_UPDATE', {
        filename,
        summary,
        message: `File updated: ${filename}`,
        updated: Date.now()
      });
    } catch (e: any) {
      console.error("[DevState] Failed to refresh workspace scan on file change:", e);
    }
  });
}

startServer();
