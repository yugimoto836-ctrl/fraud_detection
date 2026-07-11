import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "@/lib/api";

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
    test_set_size: number;
    fraud_caught: number;
    fraud_missed: number;
    false_alarms: number;
  };
};

export default function ModelInfo() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ModelInfo>("/api/model-info")
      .then((res) => setInfo(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-amber-400" />
          Model Details
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          How the deployed model performs on transactions it never trained on.
        </p>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {info && (
          <>
            {/* The tradeoff, made concrete */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wide">
                On {info.model.test_set_size.toLocaleString()} held-out transactions
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <OutcomeCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  count={info.model.fraud_caught}
                  label="Fraud caught"
                  color="emerald"
                />
                <OutcomeCard
                  icon={<XCircle className="h-5 w-5" />}
                  count={info.model.fraud_missed}
                  label="Fraud missed"
                  color="red"
                />
                <OutcomeCard
                  icon={<AlertTriangle className="h-5 w-5" />}
                  count={info.model.false_alarms}
                  label="False alarms"
                  color="amber"
                />
              </div>
              <p className="text-sm text-slate-400 mt-5 leading-relaxed">
                At the deployed decision threshold of{" "}
                <span className="font-mono text-slate-200">{info.model.deployed_threshold}</span>,
                the model catches{" "}
                <span className="text-emerald-400 font-medium">
                  {(info.model.recall * 100).toFixed(1)}%
                </span>{" "}
                of real fraud, and{" "}
                <span className="text-emerald-400 font-medium">
                  {(info.model.precision * 100).toFixed(1)}%
                </span>{" "}
                of everything it flags turns out to actually be fraud. The threshold was chosen
                deliberately, a lower threshold catches more fraud at the cost of more false
                alarms for analysts to review; this project prioritizes catching more real fraud
                over minimizing alerts.
              </p>
            </div>

            {/* Visual breakdown of the confusion matrix outcomes */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wide">
                Outcome Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { name: "Fraud Caught", count: info.model.fraud_caught },
                    { name: "Fraud Missed", count: info.model.fraud_missed },
                    { name: "False Alarms", count: info.model.false_alarms },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    cursor={{ fill: "#1e293b", opacity: 0.4 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    <Cell fill="#34d399" />
                    <Cell fill="#f87171" />
                    <Cell fill="#fbbf24" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <MetricCard label="Precision" value={`${(info.model.precision * 100).toFixed(1)}%`} />
              <MetricCard label="Recall" value={`${(info.model.recall * 100).toFixed(1)}%`} />
              <MetricCard label="PR-AUC" value={info.model.pr_auc.toFixed(3)} />
            </div>

            {/* Dataset + architecture */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wide flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-500" />
                Dataset &amp; Architecture
              </h2>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-slate-400">Total transactions</dt>
                <dd className="font-mono text-right">
                  {info.dataset.total_transactions.toLocaleString()}
                </dd>

                <dt className="text-slate-400">Known fraud cases</dt>
                <dd className="font-mono text-right">
                  {info.dataset.fraud_transactions.toLocaleString()}
                </dd>

                <dt className="text-slate-400">Base fraud rate</dt>
                <dd className="font-mono text-right">{info.dataset.fraud_rate_pct}%</dd>

                <dt className="text-slate-400">Algorithm</dt>
                <dd className="text-right text-slate-300">{info.model.algorithm}</dd>
              </dl>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const outcomeColors = {
  emerald: "text-emerald-400 bg-emerald-500/10",
  red: "text-red-400 bg-red-500/10",
  amber: "text-amber-400 bg-amber-500/10",
};

function OutcomeCard({
  icon,
  count,
  label,
  color,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  color: keyof typeof outcomeColors;
}) {
  return (
    <div className="text-center">
      <div className={`inline-flex p-2.5 rounded-lg mb-2 ${outcomeColors[color]}`}>{icon}</div>
      <p className="text-2xl font-mono font-semibold">{count}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-xl font-mono font-semibold text-slate-100">{value}</p>
    </div>
  );
}