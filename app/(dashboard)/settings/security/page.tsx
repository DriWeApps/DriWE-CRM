"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Save, Lock } from "lucide-react";

export default function SecurityPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("New password and Confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/settings/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Password changed successfully.");

        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl p-6">

      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <Link
          href="/settings"
          className="rounded-xl border border-slate-800 p-2 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>

          <div className="mb-2 flex items-center gap-2">

            <Shield className="text-yellow-400" size={28} />

            <h1 className="text-3xl font-bold text-white">
              Security
            </h1>

          </div>

          <p className="text-slate-400">
            Change your account password.
          </p>

        </div>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6"
      >

        {/* Current Password */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Current Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* New Password */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            New Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Confirm Password */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Confirm Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

        </div>

        {/* Password Requirements */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

          <h3 className="mb-2 font-medium text-white">
            Password Requirements
          </h3>

          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Minimum 8 characters</li>
            <li>• At least one uppercase letter</li>
            <li>• At least one lowercase letter</li>
            <li>• At least one number</li>
            <li>• At least one special character</li>
          </ul>

        </div>

        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />

          {loading ? "Updating..." : "Change Password"}
        </button>

      </form>
    </div>
  );
}