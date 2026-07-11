import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      const form = new URLSearchParams();
      form.append("username", data.email);
      form.append("password", data.password);

      const response = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setToken(response.data.access_token);
      toast.success("Logged in.");
      navigate("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Login failed.";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-slate-900 p-8 rounded-lg border border-slate-800"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="relative">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-xl font-semibold">FraudWatch AI</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Sign in to continue</p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 font-medium hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}