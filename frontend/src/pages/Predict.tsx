import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

const V_FIELDS = Array.from({ length: 28 }, (_, i) => `V${i + 1}`);

type Features = Record<string, number>;

type PredictionResult = {
  is_fraud: boolean;
  fraud_probability: number;
  anomaly_score: number;
  threshold: number;
};

export default function Predict() {
  const [advanced, setAdvanced] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [features, setFeatures] = useState<Features | null>(null);
  const [amount, setAmount] = useState("50.00");
  const [hour, setHour] = useState("14");
  const [result, setResult] = useState<PredictionResult | null>(null);

  const loadSample = async () => {
    setLoadingSample(true);
    setResult(null);
    try {
      const response = await api.get<Features>("/api/sample-transaction");
      setFeatures(response.data);
      setAmount(String(response.data.Amount));
      setHour(String(response.data.Hour));
    } catch {
      toast.error("Could not load a sample transaction.");
    } finally {
      setLoadingSample(false);
    }
  };

  const updateVField = (key: string, value: string) => {
    if (!features) return;
    const parsed = parseFloat(value);
    setFeatures({ ...features, [key]: Number.isNaN(parsed) ? 0 : parsed });
  };

  const runPrediction = async () => {
    if (!features) {
      toast.error("Load a sample transaction first — V1–V28 need real values.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const payload: Features = {
        ...features,
        Amount: parseFloat(amount) || 0,
        Hour: parseFloat(hour) || 0,
      };
      const response = await api.post<PredictionResult>("/api/predict", { features: payload });
      setResult(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Prediction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Run a Prediction</h1>
          <p className="text-sm text-slate-400 mt-1">
            Scores a transaction with the live XGBoost + Isolation Forest models.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={loadSample}
              disabled={loadingSample}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              {loadingSample ? "Loading..." : "Load real sample transaction"}
            </button>

            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={advanced}
                onChange={(e) => setAdvanced(e.target.checked)}
                className="accent-indigo-500"
              />
              Advanced (edit V1–V28)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                Hour of day (0–23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!features && (
            <p className="text-sm text-slate-500 italic mb-4">
              V1–V28 are anonymized PCA features from the original dataset — load a real
              sample transaction above to populate them (there's no meaningful way to hand-type
              these).
            </p>
          )}

          {features && advanced && (
            <div className="grid grid-cols-4 gap-2 mb-4 max-h-64 overflow-y-auto p-3 bg-slate-950 rounded-md border border-slate-800">
              {V_FIELDS.map((key) => (
                <div key={key}>
                  <label className="block text-[10px] text-slate-500 mb-0.5">{key}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={features[key] ?? 0}
                    onChange={(e) => updateVField(key, e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={runPrediction}
            disabled={submitting || !features}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {submitting ? "Scoring..." : "Run Prediction"}
          </button>
        </div>

        {result && (
          <div
            className={`rounded-lg p-6 border ${
              result.is_fraud
                ? "bg-red-950/40 border-red-800"
                : "bg-emerald-950/40 border-emerald-800"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`h-3 w-3 rounded-full ${
                  result.is_fraud ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              <h2 className="text-lg font-semibold">
                {result.is_fraud ? "Flagged as Fraud" : "Looks Legitimate"}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                  Fraud Probability
                </p>
                <p className="font-mono text-lg">
                  {(result.fraud_probability * 100).toFixed(3)}%
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                  Anomaly Score
                </p>
                <p className="font-mono text-lg text-amber-400">
                  {result.anomaly_score.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Threshold</p>
                <p className="font-mono text-lg text-slate-400">{result.threshold}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}