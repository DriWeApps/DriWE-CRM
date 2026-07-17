"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Shield,
  Bell,
  ArrowRight,
  Settings,
} from "lucide-react";

export default function SettingsPage() {
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success) {
        setRole(data.user.role);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="p-6">

      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <div className="rounded-2xl bg-cyan-500/20 p-4">
          <Settings className="h-8 w-8 text-cyan-400" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Settings
          </h1>

          <p className="text-slate-400">
            Manage your CRM settings and preferences.
          </p>
        </div>

      </div>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">

        {/* Profile */}

        <Link
          href="/settings/profile"
          className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-cyan-500/10 p-3">
                <User className="text-cyan-400" />
              </div>

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Profile
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update your personal information.
                </p>

              </div>

            </div>

            <ArrowRight className="text-slate-500 transition group-hover:text-cyan-400" />

          </div>
        </Link>

        {/* Company (Admin Only) */}

        {role === "ADMIN" && (

          <Link
            href="/settings/company"
            className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-green-500/10 p-3">
                  <Building2 className="text-green-400" />
                </div>

                <div>

                  <h2 className="text-xl font-semibold text-white">
                    Company
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Manage company information.
                  </p>

                </div>

              </div>

              <ArrowRight className="text-slate-500 transition group-hover:text-green-400" />

            </div>
          </Link>

        )}

        {/* Security */}

        <Link
          href="/settings/security"
          className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-yellow-500/10 p-3">
                <Shield className="text-yellow-400" />
              </div>

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Security
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Change your account password.
                </p>

              </div>

            </div>

            <ArrowRight className="text-slate-500 transition group-hover:text-yellow-400" />

          </div>
        </Link>

        {/* Notifications */}

        <Link
          href="/settings/notifications"
          className="group rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-purple-500/10 p-3">
                <Bell className="text-purple-400" />
              </div>

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Notifications
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Manage reminders and notifications.
                </p>

              </div>

            </div>

            <ArrowRight className="text-slate-500 transition group-hover:text-purple-400" />

          </div>
        </Link>

      </div>

      {/* Footer */}

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">

        <h2 className="text-lg font-semibold text-white">
          System Information
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">

          <div>
            <p className="text-sm text-slate-400">
              CRM Version
            </p>

            <p className="font-medium text-white">
              v1.0.0
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Database
            </p>

            <p className="font-medium text-green-400">
              Connected
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">
              Environment
            </p>

            <p className="font-medium text-cyan-400">
              Production
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}