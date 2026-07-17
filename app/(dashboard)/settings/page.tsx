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

import PageContainer from "@/components/layout/page-container";

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
    <PageContainer
      title="Settings"
      description="Manage your CRM settings and preferences."
      icon={<Settings size={30} />}
    >
      <div className="space-y-8">

        {/* Setting Cards */}

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Profile */}

         <Link
  href="/settings/profile"
  className="group flex w-full items-center justify-between rounded-3xl border border-slate-800 bg-zinc-900/70 p-8 transition-all duration-300 hover:border-cyan-500 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-cyan-500/10"
>
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-cyan-500/10 p-4">
                  <User className="h-7 w-7 text-cyan-400" />
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

              <ArrowRight className="text-slate-500 transition group-hover:text-cyan-400 group-hover:translate-x-1" />

            </div>
          </Link>

          {/* Company */}

          {role === "ADMIN" && (
            <Link
              href="/settings/company"
              className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:-translate-y-1 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-green-500/10 p-4">
                    <Building2 className="h-7 w-7 text-green-400" />
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

                <ArrowRight className="text-slate-500 transition group-hover:text-green-400 group-hover:translate-x-1" />

              </div>
            </Link>
          )}

          {/* Security */}

          <Link
            href="/settings/security"
            className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:-translate-y-1 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10"
          >
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-yellow-500/10 p-4">
                  <Shield className="h-7 w-7 text-yellow-400" />
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

              <ArrowRight className="text-slate-500 transition group-hover:text-yellow-400 group-hover:translate-x-1" />

            </div>
          </Link>

          {/* Notifications */}

          <Link
            href="/settings/notifications"
            className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-purple-500/10 p-4">
                  <Bell className="h-7 w-7 text-purple-400" />
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

              <ArrowRight className="text-slate-500 transition group-hover:text-purple-400 group-hover:translate-x-1" />

            </div>
          </Link>

        </div>

        {/* System Information */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">

          <h2 className="text-2xl font-semibold text-white">
            System Information
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">

<div className="mt-10 w-full rounded-3xl border border-slate-800 bg-zinc-900/70 p-8">
            {/* <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6"> */}
              <p className="text-sm text-slate-400">
                CRM Version
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                v1.0.0
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm text-slate-400">
                Database
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">
                Connected
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm text-slate-400">
                Environment
              </p>

              <p className="mt-2 text-2xl font-bold text-cyan-400">
                Production
              </p>
            </div>

          </div>

        </div>

      </div>
    </PageContainer>
  );
}