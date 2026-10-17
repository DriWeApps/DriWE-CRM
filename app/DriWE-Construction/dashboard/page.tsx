"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2,
    Users,
    ClipboardCheck,
    Package,
    RefreshCw,
    HardHat,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    FolderKanban,
    MapPin,
    LogOut,
} from "lucide-react";

type DashboardStats = {
    workersToday: number;
    tasksCompleted: number;
    tasksTotal: number;
    materialMovement: number;
};

type DashboardProject = {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
};

type DashboardResponse = {
    success?: boolean;
    workersToday?: number;
    tasksCompleted?: number;
    tasksTotal?: number;
    materialMovement?: number;
    projects?: DashboardProject[];
    error?: string;
    message?: string;
};

const statCards = [
    {
        key: "workersToday" as const,
        title: "Workers Today",
        description: "Workers currently recorded for today",
        icon: Users,
        iconClass: "bg-orange-500/10 text-orange-400",
    },
    {
        key: "tasksCompleted" as const,
        title: "Tasks Completed",
        description: "Construction tasks completed",
        icon: CheckCircle2,
        iconClass: "bg-green-500/10 text-green-400",
    },
    {
        key: "tasksTotal" as const,
        title: "Total Tasks",
        description: "Total construction tasks",
        icon: ClipboardCheck,
        iconClass: "bg-blue-500/10 text-blue-400",
    },
    {
        key: "materialMovement" as const,
        title: "Material Movement",
        description: "Material transactions recorded",
        icon: Package,
        iconClass: "bg-purple-500/10 text-purple-400",
    },
];

export default function ConstructionDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        workersToday: 0,
        tasksCompleted: 0,
        tasksTotal: 0,
        materialMovement: 0,
    });

    const [projects, setProjects] = useState<DashboardProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/construction/dashboard", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data: DashboardResponse = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        "Failed to load construction dashboard"
                );
            }

            setStats({
                workersToday: Number(data.workersToday ?? 0),
                tasksCompleted: Number(data.tasksCompleted ?? 0),
                tasksTotal: Number(data.tasksTotal ?? 0),
                materialMovement: Number(data.materialMovement ?? 0),
            });

            setProjects(Array.isArray(data.projects) ? data.projects : []);
        } catch (error) {
            console.error("Failed to load construction dashboard:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const formatNumber = (value: number) =>
        new Intl.NumberFormat("en-IN").format(value);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            window.location.href = "/login";
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[140px]" />
                <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[140px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/20">
                            <HardHat className="h-6 w-6 text-black" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                DriWE Construction
                            </h1>
                            <p className="text-sm text-zinc-500">
                                Construction Management Platform
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={loadDashboard}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-orange-500/40 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-white"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="relative z-10 px-6 py-10">
                <div className="mx-auto max-w-7xl">
                    {/* Page Heading */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                                <Building2 className="h-6 w-6 text-orange-400" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Construction Dashboard
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Live overview of your construction operations
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
                            <div>
                                <p className="text-sm font-medium text-red-400">
                                    Unable to load dashboard
                                </p>
                                <p className="mt-1 text-sm text-red-400/70">
                                    {error}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={loadDashboard}
                                className="shrink-0 text-sm font-medium text-red-300 underline underline-offset-4 hover:text-white"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => {
                            const Icon = card.icon;
                            const value = stats[card.key];

                            return (
                                <div
                                    key={card.key}
                                    className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
                                >
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {loading && (
                                            <RefreshCw className="h-4 w-4 animate-spin text-zinc-700" />
                                        )}
                                    </div>

                                    <div className="mt-5">
                                        <p className="text-sm text-zinc-500">
                                            {card.title}
                                        </p>

                                        <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                                            {formatNumber(value)}
                                        </p>

                                        <p className="mt-2 text-xs text-zinc-600">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Projects */}
                    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70">
                        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FolderKanban className="h-5 w-5 text-orange-400" />
                                    <h3 className="font-semibold text-white">
                                        Projects
                                    </h3>
                                </div>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Your construction projects
                                </p>
                            </div>

                            <Link
                                href="/DriWE-Construction/projects"
                                className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-orange-500/40 hover:bg-zinc-800 hover:text-white"
                            >
                                View Projects
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {projects.length > 0 ? (
                            <div className="divide-y divide-zinc-800">
                                {projects.slice(0, 5).map((project) => (
                                    <Link
                                        key={project.projectId}
                                        href={`/DriWE-Construction/projects/${project.projectId}`}
                                        className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-zinc-800/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-white">
                                                {project.projectName}
                                            </p>

                                            {project.location && (
                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="truncate">
                                                        {project.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3">
                                            {project.status && (
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        project.status === "Active"
                                                            ? "bg-green-500/10 text-green-400"
                                                            : project.status === "Completed"
                                                              ? "bg-blue-500/10 text-blue-400"
                                                              : project.status === "On Hold"
                                                                ? "bg-yellow-500/10 text-yellow-400"
                                                                : project.status === "Cancelled"
                                                                  ? "bg-red-500/10 text-red-400"
                                                                  : "bg-zinc-800 text-zinc-400"
                                                    }`}
                                                >
                                                    {project.status}
                                                </span>
                                            )}

                                            <ArrowRight className="h-4 w-4 text-zinc-600" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
                                    <FolderKanban className="h-6 w-6 text-zinc-600" />
                                </div>

                                <h4 className="mt-4 font-medium text-zinc-300">
                                    No projects available
                                </h4>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Create a construction project to start
                                    managing your sites, workers and tasks.
                                </p>

                                <Link
                                    href="/DriWE-Construction/projects/new"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400"
                                >
                                    Create Project
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-zinc-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>
                            Dashboard figures are based on currently recorded
                            construction data.
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}