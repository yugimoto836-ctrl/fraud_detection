import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import { getToken } from "@/lib/auth";

type LiveEvent = {
  features: Record<string, number>;
  is_fraud: boolean;
  fraud_probability: number;
  anomaly_score: number;
  threshold: number;
};

const WS_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /^http/,
  "ws"
);


export default function Live() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const connect = () => {
    const token = getToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/live?token=${token}`);

    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const data: LiveEvent = JSON.parse(event.data);
      setEvents((prev) => [data, ...prev]);
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    wsRef.current = ws;
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  };

  // Always close the socket when leaving the page — otherwise it keeps
  // running in the background, consuming backend resources for no reason
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const fraudCount = events.filter((e) => e.is_fraud).length;
  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const pageEvents = events.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            <span className="text-xs font-mono text-slate-400">
              {connected ? "STREAMING" : "DISCONNECTED"}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-400" />
              Live Feed
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real held-out transactions, scored by the live model every ~2 seconds.
            </p>
          </div>

          <button
            onClick={connected ? disconnect : connect}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              connected
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {connected ? "Stop Stream" : "Start Stream"}
          </button>
        </div>

        {events.length > 0 && (
          <div className="flex gap-4 mb-6 text-sm">
            <span className="text-slate-400">
              <span className="font-mono text-slate-100">{events.length}</span> scored
            </span>
            <span className="text-slate-400">
              <span className="font-mono text-red-400">{fraudCount}</span> flagged
            </span>
          </div>
        )}

        <div className="space-y-2">
          {events.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              {connected ? "Waiting for the first transaction..." : "Start the stream to see live predictions."}
            </div>
          )}

          {pageEvents.map((e, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                e.is_fraud
                  ? "bg-red-950/30 border-red-900"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {e.is_fraud ? (
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    ${e.features.Amount?.toFixed(2)} &middot; Hour {e.features.Hour}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    p={e.fraud_probability.toFixed(4)} &middot; anomaly={e.anomaly_score.toFixed(3)}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-mono px-2 py-1 rounded ${
                  e.is_fraud
                    ? "bg-red-500/20 text-red-300"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                {e.is_fraud ? "FRAUD" : "LEGIT"}
              </span>
            </div>
          ))}
        </div>
        {events.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-sm text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Newer
            </button>
            <span className="text-xs font-mono text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-sm text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Older →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}