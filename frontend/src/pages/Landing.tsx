import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Eye, GitBranch, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] bg-indigo-600/10 blur-3xl rounded-full" />

      <nav className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="font-semibold tracking-tight">FraudWatch AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-mono mb-6 border border-emerald-900 bg-emerald-950/30 px-3 py-1 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE MODEL &middot; ONNX RUNTIME
        </div>
        <h1 className="text-5xl font-semibold tracking-tight mb-6 leading-tight">
          Real-time fraud detection,
          <br />
          <span className="text-emerald-400">built on real labeled data.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          A supervised XGBoost model paired with an Isolation Forest anomaly signal, trained on
          the ULB credit card fraud dataset, served via ONNX behind a FastAPI backend with a
          live transaction scoring feed.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Try it live <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-md font-medium text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-8 pb-24 grid grid-cols-3 gap-6">
        <FeatureCard
          icon={<Zap className="h-5 w-5" />}
          title="Two-signal scoring"
          description="A supervised model trained on real fraud labels, paired with an unsupervised anomaly signal as a second opinion — not one blended, ambiguous score."
          accent="indigo"
        />
        <FeatureCard
          icon={<Eye className="h-5 w-5" />}
          title="Live transaction feed"
          description="Watch real held-out transactions get scored in real time, with the exact same model that powers on-demand predictions."
          accent="emerald"
        />
        <FeatureCard
          icon={<GitBranch className="h-5 w-5" />}
          title="Honest evaluation"
          description="A deliberately chosen decision threshold, time-based train/test split, and real precision/recall reported — not hand-picked numbers."
          accent="amber"
        />
      </div>
    </div>
  );
}

const accentMap = {
  indigo: "text-indigo-400 bg-indigo-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-400 bg-amber-500/10",
};

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: keyof typeof accentMap;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${accentMap[accent]}`}>{icon}</div>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}