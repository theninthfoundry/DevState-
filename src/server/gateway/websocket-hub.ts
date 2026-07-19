import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';

export class TelemetryHub {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(httpServer: Server) {
    this.wss = new WebSocketServer({ server: httpServer, path: '/telemetry' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log(`[DevState] Terminal connected: ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send initial handshake
      this.dispatch('SYSTEM_INIT', { 
        status: 'online', 
        message: 'Neurolink established.' 
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  /**
   * Blast live workspace telemetry to all connected DevState HUD clients.
   */
  public dispatch(eventType: string, payload: any) {
    const frame = JSON.stringify({
      type: eventType,
      timestamp: Date.now(),
      payload
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(frame);
      }
    }
  }
}
