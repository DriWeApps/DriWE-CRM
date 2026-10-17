
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Building2,
    CalendarDays,
    MapPin,
    Plus,
    Users,
    ArrowRight,
    HardHat,
    UserRound,
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
} from "lucide-react";

interface Project {
    projectId: string;
    projectName: string;
    location: string;
    projectManagerName?: string;
    startDate: string;
    expectedCompletion: string;
    status: string;
    workerCount?: number;
}

type SortKey = "recent" | "name" | "completion";

const STATUS_OPTIONS = [
    "All",
    "Active",
    "Planning",
    "On Hold",
    "Completed",
    "Cancelled",
];

const SORT_LABELS: Record<SortKey, string> = {
    recent: "Start date",
    name: "Name (A–Z)",
    completion: "Completion date",
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortKey, setSortKey] = useState<SortKey>("recent");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);

    async function loadProjects() {
        try {
            setLoading(true);
            setLoadError(false);

            const response = await fetch("/api/construction/projects", {
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to load projects: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.success) {
                setProjects(
                    Array.isArray(data.projects) ? data.projects : []
                );
            } else {
                setLoadError(true);
            }
        } catch (error) {
            console.error("Failed to load projects:", error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    function getStatusClass(status: string) {
        switch (status) {
            case "Active":
                return "border-green-500/30 bg-green-500/10 text-green-400";
            case "Completed":
                return "border-blue-500/30 bg-blue-500/10 text-blue-400";
            case "On Hold":
                return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
            case "Cancelled":
                return "border-red-500/30 bg-red-500/10 text-red-400";
            case "Planning":
                return "border-orange-500/30 bg-orange-500/10 text-orange-400";
            default:
                return "border-zinc-700 bg-zinc-900 text-zinc-300";
        }
    }

    function getStatusDot(status: string) {
        switch (status) {
            case "Active":
                return "bg-green-500";
            case "Completed":
                return "bg-blue-500";
            case "On Hold":
                return "bg-yellow-500";
            case "Cancelled":
                return "bg-red-500";
            case "Planning":
                return "bg-orange-500";
            default:
                return "bg-zinc-500";
        }
    }

    // Statistics are calculated from all loaded projects, independent of filters.
    const stats = useMemo(() => {
        return {
            total: projects.length,
            active: projects.filter(
                (project) => project.status === "Active"
            ).length,
            workers: projects.reduce(
                (sum, project) => sum + (project.workerCount ?? 0),
                0
            ),
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        let result = [...projects];

        if (statusFilter !== "All") {
            result = result.filter(
                (project) => project.status === statusFilter
            );
        }

        const searchTerm = query.trim().toLowerCase();

        if (searchTerm) {
            result = result.filter((project) => {
                return (
                    (project.projectName ?? "")
                        .toLowerCase()
                        .includes(searchTerm) ||
                    (project.location ?? "")
                        .toLowerCase()
                        .includes(searchTerm) ||
                    (project.projectManagerName ?? "")
                        .toLowerCase()
                        .includes(searchTerm)
                );
            });
        }

        result.sort((a, b) => {
            if (sortKey === "name") {
                return a.projectName.localeCompare(b.projectName);
            }

            if (sortKey === "completion") {
                return (
                    new Date(a.expectedCompletion).getTime() -
                    new Date(b.expectedCompletion).getTime()
                );
            }

            // Most recently started projects appear first.
            return (
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime()
            );
        });

        return result;
    }, [projects, query, statusFilter, sortKey]);

    const filtersActive =
        query.trim() !== "" || statusFilter !== "All";

    function clearFilters() {
        setQuery("");
        setStatusFilter("All");
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-zinc-900">
                            <Building2 className="h-6 w-6 text-orange-400" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Projects
                            </h1>
                            <p className="mt-1 text-sm text-zinc-300">
                                Manage construction projects, workers and tasks.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/DriWE-Construction/projects/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                        <Plus className="h-4 w-4" />
                        New Project
                    </Link>
                </div>

                {/* Statistics */}
                {!loading && !loadError && projects.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                            <p className="text-xs font-medium text-zinc-300">
                                Total projects
                            </p>
                            <p className="mt-2 text-2xl font-bold text-white">
                                {stats.total}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <p className="text-xs font-medium text-zinc-300">
                                    Active
                                </p>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-white">
                                {stats.active}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                            <p className="text-xs font-medium text-zinc-300">
                                Workers
                            </p>
                            <p className="mt-2 text-2xl font-bold text-white">
                                {stats.workers}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search, filters and sorting */}
                {!loading && !loadError && projects.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by project, location or manager"
                                aria-label="Search projects"
                                className="w-full rounded-xl border border-zinc-800 bg-black py-3 pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                            />

                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Desktop status filters */}
                        <div className="hidden flex-wrap items-center gap-2 md:flex">
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    type="button"
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    aria-pressed={statusFilter === status}
                                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                                        statusFilter === status
                                            ? "border-orange-500 bg-orange-500/10 text-orange-300"
                                            : "border-zinc-800 bg-black text-zinc-300 hover:border-zinc-600 hover:text-white"
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Mobile status filter */}
                        <div className="md:hidden">
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                aria-label="Filter projects by status"
                                className="w-full appearance-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option
                                        key={status}
                                        value={status}
                                        className="bg-black text-white"
                                    >
                                        {status === "All"
                                            ? "All statuses"
                                            : status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setSortMenuOpen((open) => !open)
                                }
                                aria-expanded={sortMenuOpen}
                                className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white transition hover:border-zinc-600 md:w-auto"
                            >
                                <SlidersHorizontal className="h-4 w-4 text-zinc-300" />
                                <span>{SORT_LABELS[sortKey]}</span>
                                <ChevronDown className="h-4 w-4 text-zinc-300" />
                            </button>

                            {sortMenuOpen && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close sort menu"
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setSortMenuOpen(false)}
                                    />

                                    <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl">
                                        {(
                                            Object.keys(SORT_LABELS) as SortKey[]
                                        ).map((key) => (
                                            <button
                                                type="button"
                                                key={key}
                                                onClick={() => {
                                                    setSortKey(key);
                                                    setSortMenuOpen(false);
                                                }}
                                                className={`block w-full px-4 py-3 text-left text-sm transition ${
                                                    sortKey === key
                                                        ? "bg-orange-500/10 text-orange-300"
                                                        : "text-white hover:bg-zinc-900"
                                                }`}
                                            >
                                                {SORT_LABELS[key]}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Filter summary */}
                {!loading && !loadError && filtersActive && (
                    <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                        <span>
                            Showing {filteredProjects.length} of{" "}
                            {projects.length} projects
                        </span>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="font-semibold text-orange-400 transition hover:text-orange-300"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse rounded-3xl border border-zinc-800 bg-black p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-800" />
                                    <div className="h-5 w-16 rounded-full bg-zinc-800" />
                                </div>

                                <div className="mt-5 h-5 w-2/3 rounded bg-zinc-800" />
                                <div className="mt-3 h-4 w-1/2 rounded bg-zinc-800" />

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="h-20 rounded-xl bg-zinc-900" />
                                    <div className="h-20 rounded-xl bg-zinc-900" />
                                </div>

                                <div className="mt-3 h-14 rounded-xl bg-zinc-900" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Load error */}
                {!loading && loadError && (
                    <div className="rounded-3xl border border-red-500/30 bg-black px-6 py-16 text-center">
                        <p className="text-sm font-semibold text-red-400">
                            Couldn&apos;t load projects
                        </p>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-300">
                            Check your connection and try again.
                        </p>

                        <button
                            type="button"
                            onClick={loadProjects}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:border-orange-500 hover:text-orange-300"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* No projects */}
                {!loading && !loadError && projects.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-zinc-700 bg-black px-6 py-20 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-zinc-900">
                            <HardHat className="h-8 w-8 text-orange-400" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-white">
                            No projects yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-300">
                            Create your first construction project and start
                            managing workers and tasks.
                        </p>

                        <Link
                            href="/DriWE-Construction/projects/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                        >
                            <Plus className="h-4 w-4" />
                            Create Project
                        </Link>
                    </div>
                )}

                {/* No filter matches */}
                {!loading &&
                    !loadError &&
                    projects.length > 0 &&
                    filteredProjects.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-zinc-700 bg-black px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
                                <Search className="h-6 w-6 text-zinc-300" />
                            </div>

                            <h2 className="mt-4 text-lg font-bold text-white">
                                No matching projects
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-300">
                                Try a different search term or clear your
                                filters.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:border-orange-500 hover:text-orange-300"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}

                {/* Project cards */}
                {!loading &&
                    !loadError &&
                    filteredProjects.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.projectId}
                                    className="group rounded-3xl border border-zinc-800 bg-black p-6 transition hover:-translate-y-1 hover:border-orange-500/40"
                                >
                                    {/* Card header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-zinc-900">
                                            <Building2 className="h-6 w-6 text-orange-400" />
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                                project.status
                                            )}`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                                    project.status
                                                )}`}
                                            />
                                            {project.status}
                                        </span>
                                    </div>

                                    {/* Project name */}
                                    <h2 className="mt-5 break-words text-xl font-bold text-white">
                                        {project.projectName}
                                    </h2>

                                    {/* Location */}
                                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                                        <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                                        <span className="truncate">
                                            {project.location ||
                                                "Location not specified"}
                                        </span>
                                    </div>

                                    {/* Worker count */}
                                    <div className="mt-5">
                                        <div className="rounded-xl border border-zinc-800 bg-black p-4">
                                            <div className="flex items-center gap-2 text-xs text-zinc-300">
                                                <UserRound className="h-4 w-4 text-orange-400" />
                                                Workers
                                            </div>

                                            <p className="mt-2 text-2xl font-bold text-white">
                                                {project.workerCount ?? 0}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-400">
                                                Total workers
                                            </p>
                                        </div>
                                    </div>

                                    {/* Project manager */}
                                    <div className="mt-3">
                                        <div className="min-w-0 rounded-xl border border-zinc-800 bg-black p-3">
                                            <div className="flex items-center gap-2 text-xs text-zinc-300">
                                                <Users className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                                                Project Manager
                                            </div>

                                            <p className="mt-2 truncate text-sm text-white">
                                                {project.projectManagerName ||
                                                    "Not assigned"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-3">
                                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                                            <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                                            Project Timeline
                                        </div>

                                        <p className="mt-2 text-sm text-white">
                                            {project.startDate || "Not set"}
                                            <span className="mx-2 text-zinc-500">
                                                →
                                            </span>
                                            {project.expectedCompletion ||
                                                "Not set"}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-5 grid grid-cols-1 gap-3">
                                        <Link
                                            href={`/DriWE-Construction/projects/${project.projectId}`}
                                            className="flex items-center justify-between gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:border-orange-500/50 hover:bg-zinc-900 hover:text-orange-300"
                                        >
                                            View Project
                                            <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </main>
    );
}
