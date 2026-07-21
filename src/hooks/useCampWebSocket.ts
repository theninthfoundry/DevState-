import { useEffect, useRef } from 'react';
import { useHUDStore } from '../store/useHUDStore';

export const useCampWebSocket = () => {
  const setAgents = useHUDStore((s) => s.setAgents);
  const setSelectedAgentId = useHUDStore((s) => s.setSelectedAgentId);
  const selectedAgentId = useHUDStore((s) => s.selectedAgentId);
  const setSystemStatus = useHUDStore((s) => s.setSystemStatus);
  const setAlerts = useHUDStore((s) => s.setAlerts);
  const appendLog = useHUDStore((s) => s.appendLog);
  const updateMetrics = useHUDStore((s) => s.updateMetrics);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    const connect = () => {
      // Connect to the CAMP API server running on port 8000
      const wsUri = 'ws://localhost:8000/api/ws';
      console.log(`[useCampWebSocket] Connecting to CAMP API at ${wsUri}`);
      
      const ws = new WebSocket(wsUri);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!active) return;
        appendLog({
          source: 'CAMP Gateway',
          level: 'success',
          message: 'Connected to CAMP (Cognitive Agent Monitoring Platform) telemetry stream.',
        });
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'system_tick') {
            setSystemStatus(data.system);
            setAgents(data.agents);
            setAlerts(data.alerts);

            // Auto-select first agent if none selected
            if (!selectedAgentId && data.agents.length > 0) {
              setSelectedAgentId(data.agents[0].uid);
            }

            // Sync global HUD metrics
            const healthyCount = data.agents.length;
            const activeErrCount = data.alerts.filter((a: any) => !a.resolved).length;
            
            updateMetrics({
              activeErrors: activeErrCount,
              healthyModules: healthyCount,
              cognitiveLoad: Math.round((data.system.system_state?.entropy || 1.5) * 10),
              networkLatency: Math.round(data.system.ticks_per_sec > 0 ? (1000 / data.system.ticks_per_sec) : 30)
            });
            
          } else if (data.type === 'observation') {
            const tel = data.telemetry || {};
            const isError = tel.error > 0.0;
            
            appendLog({
              source: `Agent: ${data.agent_id}`,
              level: isError ? 'error' : 'success',
              message: `Observed: Cost=$${(tel.cost || 0).toFixed(4)} | Latency=${Math.round(tel.latency || 0)}ms | Tokens=${(tel.tokens || 0).toFixed(1)}k | Error=${tel.error}`,
            });

            if (data.alerts) {
              setAlerts(data.alerts);
            }
          }
        } catch (e: any) {
          console.error('[useCampWebSocket] Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        if (!active) return;
        appendLog({
          source: 'CAMP Gateway',
          level: 'warn',
          message: 'CAMP telemetry stream closed. Attempting to reconnect in 3s...',
        });
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('[useCampWebSocket] Socket encountered error:', err);
      };
    };

    connect();

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setAgents, setSelectedAgentId, selectedAgentId, setSystemStatus, setAlerts, appendLog, updateMetrics]);

  return null;
};
