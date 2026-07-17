'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-transparent" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/30">
            <Building2 className="h-11 w-11 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">DriWE CRM</h1>
          <p className="text-slate-400 mt-2 text-center text-lg">
            Sign in to manage your clients and team
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-slate-700 rounded-2xl pl-11 py-4 text-white focus:border-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-slate-700 rounded-2xl pl-11 py-4 text-white focus:border-cyan-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-4 rounded-2xl font-semibold text-lg text-white transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DriWE CRM
          </p>
        </div>
      </div>
    </div>
  );
}