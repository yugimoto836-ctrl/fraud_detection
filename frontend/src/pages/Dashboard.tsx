import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { clearToken } from "@/lib/auth";
import {
  ShieldCheck,
  Target,
  Crosshair,
  TrendingUp,
  Activity,
  Radio,
  BarChart3,
  LogOut,
} from "lucide-react";

type ModelInfo = {
  dataset: {
    total_transactions: number;
    fraud_transactions: number;
    fraud_rate_pct: number;
  };
  model: {
    algorithm: string;
    deployed_threshold: number;
    precision: number;
    recall: number;
    pr_auc: number;
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ModelInfo>("/api/model-info")
      .then((res) => setInfo(res.data))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient glow — subtle, gives depth without being distracting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[600px] bg-indigo-600/10 blur-3xl rounded-full" />

      {/* Top nav */}
      <nav className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="font-semibold tracking-tight">FraudWatch AI</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono">
          <Radio className="h-3 w-3 animate-pulse" />
          SYSTEM OPERATIONAL
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Overview</h1>
        <p className="text-slate-400 mb-8">
          Real-time credit card fraud detection, backed by a supervised model trained on labeled
          transaction data.
        </p>

        {loading && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-lg bg-slate-900 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {info && (
          <div className="grid grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={<Target className="h-4 w-4" />}
              label="Precision"
              value={`${(info.model.precision * 100).toFixed(1)}%`}
              accent="emerald"
            />
            <StatCard
              icon={<Crosshair className="h-4 w-4" />}
              label="Recall"
              value={`${(info.model.recall * 100).toFixed(1)}%`}
              accent="emerald"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="PR-AUC"
              value={info.model.pr_auc.toFixed(3)}
              accent="amber"
            />
            <StatCard
              icon={<BarChart3 className="h-4 w-4" />}
              label="Base Fraud Rate"
              value={`${info.dataset.fraud_rate_pct}%`}
              accent="slate"
            />
          </div>
        )}

        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
          Tools
        </p>
        <div className="grid grid-cols-3 gap-4">
          <NavCard
            to="/predict"
            icon={<Activity className="h-5 w-5" />}
            title="Run a Prediction"
            description="Score a transaction with the live model."
            accent="indigo"
          />
          <NavCard
            to="/live"
            icon={<Radio className="h-5 w-5" />}
            title="Live Feed"
            description="Watch real transactions get scored in real time."
            accent="emerald"
          />
          <NavCard
            to="/model"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Model Details"
            description="Precision/recall tradeoffs and dataset breakdown."
            accent="amber"
          />
        </div>
      </div>
    </div>
  );
}

const accentMap = {
  emerald: { text: "text-emerald-400", glow: "bg-emerald-500/10", border: "border-emerald-800/50 hover:border-emerald-600" },
  amber: { text: "text-amber-400", glow: "bg-amber-500/10", border: "border-amber-800/50 hover:border-amber-600" },
  indigo: { text: "text-indigo-400", glow: "bg-indigo-500/10", border: "border-indigo-800/50 hover:border-indigo-600" },
  slate: { text: "text-slate-300", glow: "bg-slate-500/10", border: "border-slate-800 hover:border-slate-600" },
};

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: keyof typeof accentMap;
}) {
  const a = accentMap[accent];
  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className={`inline-flex p-2 rounded-lg ${a.glow} ${a.text} mb-3`}>{icon}</div>
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-mono font-semibold ${a.text}`}>{value}</p>
    </div>
  );
}

function NavCard({
  to,
  icon,
  title,
  description,
  accent,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: keyof typeof accentMap;
}) {
  const a = accentMap[accent];
  return (
    <Link
      to={to}
      className={`group block bg-slate-900 border rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${a.border}`}
    >
      <div className={`inline-flex p-2 rounded-lg ${a.glow} ${a.text} mb-3`}>{icon}</div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}