
// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";

// import {
//     Building2,
//     CalendarDays,
//     MapPin,
//     Plus,
//     Users,
//     ArrowRight,
//     Loader2,
//     HardHat,
//     Layers3,
//     UserRound,
// } from "lucide-react";

// interface Project {
//     projectId: string;
//     projectName: string;
//     location: string;
//     projectManagerName?: string;
//     siteSupervisorName?: string;
//     startDate: string;
//     expectedCompletion: string;
//     status: string;

//     // New project structure
//     siteCount?: number;
//     workerCount?: number;
// }

// export default function ProjectsPage() {
//     const [projects, setProjects] = useState<Project[]>([]);
//     const [loading, setLoading] = useState(true);

//     async function loadProjects() {
//         try {
//             setLoading(true);

//             const response = await fetch(
//                 "/api/construction/projects",
//                 {
//                     credentials: "include",
//                     cache: "no-store",
//                 }
//             );

//             const data = await response.json();

//             if (data.success) {
//                 setProjects(data.projects || []);
//             }
//         } catch (error) {
//             console.error(
//                 "Failed to load projects:",
//                 error
//             );
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         loadProjects();
//     }, []);

//     function getStatusClass(status: string) {
//         switch (status) {
//             case "Active":
//                 return "bg-green-500/10 text-green-400 border-green-500/20";

//             case "Completed":
//                 return "bg-blue-500/10 text-blue-400 border-blue-500/20";

//             case "On Hold":
//                 return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

//             case "Cancelled":
//                 return "bg-red-500/10 text-red-400 border-red-500/20";

//             case "Planning":
//                 return "bg-orange-500/10 text-orange-400 border-orange-500/20";

//             default:
//                 return "bg-zinc-800 text-zinc-400 border-zinc-700";
//         }
//     }

//     return (
//         <main className="min-h-screen bg-zinc-950 text-white">
//             <div className="mx-auto max-w-7xl px-6 py-8">

//                 {/* Header */}
//                 <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

//                     <div>
//                         <div className="flex items-center gap-3">

//                             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
//                                 <Building2 className="h-6 w-6 text-orange-400" />
//                             </div>

//                             <div>
//                                 <h1 className="text-3xl font-bold">
//                                     Projects
//                                 </h1>

//                                 <p className="mt-1 text-sm text-zinc-500">
//                                     Manage construction projects, sites and workers.
//                                 </p>
//                             </div>

//                         </div>
//                     </div>

//                     <Link
//                         href="/DriWE-Construction/projects/new"
//                         className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
//                     >
//                         <Plus className="h-4 w-4" />
//                         New Project
//                     </Link>

//                 </div>

//                 {/* Loading */}
//                 {loading && (
//                     <div className="flex min-h-[300px] items-center justify-center">
//                         <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
//                     </div>
//                 )}

//                 {/* Empty */}
//                 {!loading && projects.length === 0 && (
//                     <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-20 text-center">

//                         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
//                             <HardHat className="h-8 w-8 text-orange-400" />
//                         </div>

//                         <h2 className="mt-5 text-xl font-bold">
//                             No projects yet
//                         </h2>

//                         <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
//                             Create your first construction project and configure
//                             its sites and workers.
//                         </p>

//                         <Link
//                             href="/DriWE-Construction/projects/new"
//                             className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
//                         >
//                             <Plus className="h-4 w-4" />
//                             Create Project
//                         </Link>

//                     </div>
//                 )}

//                 {/* Projects */}
//                 {!loading && projects.length > 0 && (
//                     <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

//                         {projects.map((project) => (

//                             <div
//                                 key={project.projectId}
//                                 className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/30"
//                             >

//                                 {/* Top */}
//                                 <div className="flex items-start justify-between">

//                                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
//                                         <Building2 className="h-6 w-6 text-orange-400" />
//                                     </div>

//                                     <span
//                                         className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
//                                             project.status
//                                         )}`}
//                                     >
//                                         {project.status}
//                                     </span>

//                                 </div>

//                                 {/* Project name */}
//                                 <h2 className="mt-5 text-xl font-bold">
//                                     {project.projectName}
//                                 </h2>

//                                 {/* Location */}
//                                 <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
//                                     <MapPin className="h-4 w-4 shrink-0" />

//                                     <span className="truncate">
//                                         {project.location}
//                                     </span>
//                                 </div>

//                                 {/* Sites + Workers */}
//                                 <div className="mt-5 grid grid-cols-2 gap-3">

//                                     <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

//                                         <div className="flex items-center gap-2 text-xs text-zinc-500">
//                                             <Layers3 className="h-4 w-4 text-orange-400" />
//                                             Sites
//                                         </div>

//                                         <p className="mt-2 text-2xl font-bold text-white">
//                                             {project.siteCount ?? 0}
//                                         </p>

//                                         <p className="mt-1 text-xs text-zinc-600">
//                                             Project sites
//                                         </p>

//                                     </div>

//                                     <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

//                                         <div className="flex items-center gap-2 text-xs text-zinc-500">
//                                             <UserRound className="h-4 w-4 text-orange-400" />
//                                             Workers
//                                         </div>

//                                         <p className="mt-2 text-2xl font-bold text-white">
//                                             {project.workerCount ?? 0}
//                                         </p>

//                                         <p className="mt-1 text-xs text-zinc-600">
//                                             Total workers
//                                         </p>

//                                     </div>

//                                 </div>

//                                 {/* Manager + Supervisor */}
//                                 <div className="mt-3 grid grid-cols-2 gap-3">

//                                     <div className="rounded-xl bg-zinc-950 p-3">

//                                         <div className="flex items-center gap-2 text-xs text-zinc-600">
//                                             <Users className="h-3.5 w-3.5" />
//                                             Manager
//                                         </div>

//                                         <p className="mt-1 truncate text-sm text-zinc-300">
//                                             {project.projectManagerName ||
//                                                 "Not assigned"}
//                                         </p>

//                                     </div>

//                                     <div className="rounded-xl bg-zinc-950 p-3">

//                                         <div className="flex items-center gap-2 text-xs text-zinc-600">
//                                             <HardHat className="h-3.5 w-3.5" />
//                                             Supervisor
//                                         </div>

//                                         <p className="mt-1 truncate text-sm text-zinc-300">
//                                             {project.siteSupervisorName ||
//                                                 "Not assigned"}
//                                         </p>

//                                     </div>

//                                 </div>

//                                 {/* Timeline */}
//                                 <div className="mt-4 rounded-xl bg-zinc-950 p-3">

//                                     <div className="flex items-center gap-2 text-xs text-zinc-600">
//                                         <CalendarDays className="h-3.5 w-3.5" />
//                                         Project Timeline
//                                     </div>

//                                     <p className="mt-1 text-sm text-zinc-300">
//                                         {project.startDate}{" "}
//                                         →{" "}
//                                         {project.expectedCompletion}
//                                     </p>

//                                 </div>

//                                 {/* Actions */}
//                                 <div className="mt-5 grid grid-cols-2 gap-3">

//                                     <Link
//                                         href={`/DriWE-Construction/projects/${project.projectId}`}
//                                         className="flex items-center justify-between rounded-xl border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-400"
//                                     >
//                                         View Project

//                                         <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
//                                     </Link>

//                                     <Link
//                                         href={`/DriWE-Construction/projects/${project.projectId}/sites`}
//                                         className="flex items-center justify-center gap-2 rounded-xl bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-400 transition hover:bg-orange-500/20"
//                                     >
//                                         <Layers3 className="h-4 w-4" />
//                                         Sites & Workers
//                                     </Link>

//                                 </div>

//                             </div>

//                         ))}

//                     </div>
//                 )}

//             </div>
//         </main>
//     );
// }



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
    Layers3,
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
    siteSupervisorName?: string;
    startDate: string;
    expectedCompletion: string;
    status: string;

    // New project structure
    siteCount?: number;
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

            const data = await response.json();

            if (data.success) {
                setProjects(data.projects || []);
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
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "Completed":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "On Hold":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "Cancelled":
                return "bg-red-500/10 text-red-400 border-red-500/20";
            case "Planning":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            default:
                return "bg-zinc-800 text-zinc-400 border-zinc-700";
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

    // Derived stats across the full project set (not affected by filters)
    const stats = useMemo(() => {
        return {
            total: projects.length,
            active: projects.filter((p) => p.status === "Active").length,
            sites: projects.reduce((sum, p) => sum + (p.siteCount ?? 0), 0),
            workers: projects.reduce((sum, p) => sum + (p.workerCount ?? 0), 0),
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        let result = [...projects];

        if (statusFilter !== "All") {
            result = result.filter((p) => p.status === statusFilter);
        }

        const q = query.trim().toLowerCase();
        if (q) {
            result = result.filter((p) => {
                return (
                    p.projectName.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    (p.projectManagerName ?? "").toLowerCase().includes(q) ||
                    (p.siteSupervisorName ?? "").toLowerCase().includes(q)
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
            // recent: newest start date first
            return (
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime()
            );
        });

        return result;
    }, [projects, query, statusFilter, sortKey]);

    const filtersActive = query.trim() !== "" || statusFilter !== "All";

    function clearFilters() {
        setQuery("");
        setStatusFilter("All");
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">

            <div className="mx-auto max-w-7xl px-6 py-8">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                                <Building2 className="h-6 w-6 text-orange-400" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    Projects
                                </h1>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Manage construction projects, sites and workers.
                                </p>
                            </div>

                        </div>
                    </div>

                    <Link
                        href="/DriWE-Construction/projects/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                    >
                        <Plus className="h-4 w-4" />
                        New Project
                    </Link>

                </div>

                {/* Stats strip */}
                {!loading && projects.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            <p className="text-xs text-zinc-500">Total projects</p>
                            <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <p className="text-xs text-zinc-500">Active</p>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-white">{stats.active}</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            <p className="text-xs text-zinc-500">Sites</p>
                            <p className="mt-1 text-2xl font-bold text-white">{stats.sites}</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                            <p className="text-xs text-zinc-500">Workers</p>
                            <p className="mt-1 text-2xl font-bold text-white">{stats.workers}</p>
                        </div>
                    </div>
                )}

                {/* Toolbar: search, status filter, sort */}
                {!loading && projects.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">

                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by project, location or manager"
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-9 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/60"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Status filter pills (desktop) */}
                        <div className="hidden flex-wrap items-center gap-2 md:flex">
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                                        statusFilter === status
                                            ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                                            : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Status filter dropdown (mobile) */}
                        <div className="md:hidden">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60"
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {status === "All" ? "All statuses" : status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <button
                                onClick={() => setSortMenuOpen((v) => !v)}
                                className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 md:w-auto"
                            >
                                <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
                                <span>{SORT_LABELS[sortKey]}</span>
                                <ChevronDown className="h-4 w-4 text-zinc-500" />
                            </button>

                            {sortMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setSortMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
                                        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSortKey(key);
                                                    setSortMenuOpen(false);
                                                }}
                                                className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                                                    sortKey === key
                                                        ? "bg-orange-500/10 text-orange-400"
                                                        : "text-zinc-300 hover:bg-zinc-800"
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

                {/* Active filter summary */}
                {!loading && filtersActive && (
                    <div className="mb-6 flex items-center gap-3 text-xs text-zinc-500">
                        <span>
                            Showing {filteredProjects.length} of {projects.length} projects
                        </span>
                        <button
                            onClick={clearFilters}
                            className="font-medium text-orange-400 transition hover:text-orange-300"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-800" />
                                    <div className="h-5 w-16 rounded-full bg-zinc-800" />
                                </div>
                                <div className="mt-5 h-5 w-2/3 rounded bg-zinc-800" />
                                <div className="mt-3 h-4 w-1/2 rounded bg-zinc-800" />
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="h-20 rounded-xl bg-zinc-800/60" />
                                    <div className="h-20 rounded-xl bg-zinc-800/60" />
                                </div>
                                <div className="mt-3 h-14 rounded-xl bg-zinc-800/60" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Load error */}
                {!loading && loadError && (
                    <div className="rounded-3xl border border-red-500/30 bg-zinc-900 px-6 py-16 text-center">
                        <p className="text-sm font-medium text-red-400">
                            Couldn&apos;t load projects
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                            Check your connection and try again.
                        </p>
                        <button
                            onClick={loadProjects}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-400"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty: no projects at all */}
                {!loading && !loadError && projects.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-20 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                            <HardHat className="h-8 w-8 text-orange-400" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-white">
                            No projects yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                            Create your first construction project and configure
                            its sites and workers.
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

                {/* Empty: filters matched nothing */}
                {!loading && !loadError && projects.length > 0 && filteredProjects.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
                            <Search className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-white">
                            No matching projects
                        </h2>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                            Try a different search term or clear your filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-400"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Projects */}
                {!loading && !loadError && filteredProjects.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                        {filteredProjects.map((project) => (

                            <div
                                key={project.projectId}
                                className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/30"
                            >

                                {/* Top */}
                                <div className="flex items-start justify-between">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                                        <Building2 className="h-6 w-6 text-orange-400" />
                                    </div>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                            project.status
                                        )}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(project.status)}`} />
                                        {project.status}
                                    </span>

                                </div>

                                {/* Project name */}
                                <h2 className="mt-5 text-xl font-bold text-white">
                                    {project.projectName}
                                </h2>

                                {/* Location */}
                                <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                                    <MapPin className="h-4 w-4 shrink-0" />

                                    <span className="truncate">
                                        {project.location}
                                    </span>
                                </div>

                                {/* Sites + Workers */}
                                <div className="mt-5 grid grid-cols-2 gap-3">

                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <Layers3 className="h-4 w-4 text-orange-400" />
                                            Sites
                                        </div>

                                        <p className="mt-2 text-2xl font-bold text-white">
                                            {project.siteCount ?? 0}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-600">
                                            Project sites
                                        </p>

                                    </div>

                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <UserRound className="h-4 w-4 text-orange-400" />
                                            Workers
                                        </div>

                                        <p className="mt-2 text-2xl font-bold text-white">
                                            {project.workerCount ?? 0}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-600">
                                            Total workers
                                        </p>

                                    </div>

                                </div>

                                {/* Manager + Supervisor */}
                                <div className="mt-3 grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-zinc-950 p-3">

                                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                                            <Users className="h-3.5 w-3.5" />
                                            Manager
                                        </div>

                                        <p className="mt-1 truncate text-sm text-zinc-300">
                                            {project.projectManagerName ||
                                                "Not assigned"}
                                        </p>

                                    </div>

                                    <div className="rounded-xl bg-zinc-950 p-3">

                                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                                            <HardHat className="h-3.5 w-3.5" />
                                            Supervisor
                                        </div>

                                        <p className="mt-1 truncate text-sm text-zinc-300">
                                            {project.siteSupervisorName ||
                                                "Not assigned"}
                                        </p>

                                    </div>

                                </div>

                                {/* Timeline */}
                                <div className="mt-4 rounded-xl bg-zinc-950 p-3">

                                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Project Timeline
                                    </div>

                                    <p className="mt-1 text-sm text-zinc-300">
                                        {project.startDate}{" "}
                                        →{" "}
                                        {project.expectedCompletion}
                                    </p>

                                </div>

                                {/* Actions */}
                                <div className="mt-5 grid grid-cols-2 gap-3">

                                    <Link
                                        href={`/DriWE-Construction/projects/${project.projectId}`}
                                        className="flex items-center justify-between rounded-xl border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-400"
                                    >
                                        View Project

                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                    </Link>

                                    <Link
                                        href={`/DriWE-Construction/projects/${project.projectId}/sites`}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-400 transition hover:bg-orange-500/20"
                                    >
                                        <Layers3 className="h-4 w-4" />
                                        Sites & Workers
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