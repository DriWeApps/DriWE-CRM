"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    ArrowLeft,
    Building2,
    MapPin,
    Plus,
    Users,
    Pencil,
    Trash2,
    Loader2,
    RefreshCw,
    ExternalLink,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location: string;
    status?: string;
};

type Site = {
    siteId: string;
    companyId: string;
    projectId: string;
    projectName?: string;
    siteName: string;
    location?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    workerCount?: number;
};

export default function ProjectSitesPage() {
    const params = useParams();
    const router = useRouter();

    const projectId = params?.projectId as string;

    const [project, setProject] =
        useState<Project | null>(null);

    const [sites, setSites] =
        useState<Site[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [deletingSiteId, setDeletingSiteId] =
        useState<string | null>(null);

    const [error, setError] =
        useState("");

    /* =========================================================
       LOAD PROJECT + SITES
    ========================================================= */

    async function loadData() {
        if (!projectId) return;

        try {
            setLoading(true);
            setError("");

            const [
                projectResponse,
                sitesResponse,
            ] = await Promise.all([
                fetch(
                    `/api/construction/projects/${projectId}`,
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    `/api/construction/sites?projectId=${encodeURIComponent(
                        projectId
                    )}`,
                    {
                        cache: "no-store",
                    }
                ),
            ]);

            const projectData =
                await projectResponse.json();

            const sitesData =
                await sitesResponse.json();

            if (!projectResponse.ok) {
                throw new Error(
                    projectData?.message ||
                        "Failed to load project."
                );
            }

            if (!sitesResponse.ok) {
                throw new Error(
                    sitesData?.message ||
                        "Failed to load sites."
                );
            }

            setProject(
                projectData.project || null
            );

            /*
             * Support either:
             *
             * { sites: [...] }
             *
             * or
             *
             * { data: [...] }
             */
            setSites(
                sitesData.sites ||
                    sitesData.data ||
                    []
            );
        } catch (err: any) {
            console.error(
                "Failed to load project sites:",
                err
            );

            setError(
                err?.message ||
                    "Failed to load project sites."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [projectId]);

    /* =========================================================
       DELETE SITE
    ========================================================= */

    async function handleDeleteSite(
        site: Site
    ) {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${site.siteName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingSiteId(
                site.siteId
            );

            const response =
                await fetch(
                    `/api/construction/sites/${site.siteId}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Failed to delete site."
                );
            }

            setSites((current) =>
                current.filter(
                    (item) =>
                        item.siteId !==
                        site.siteId
                )
            );
        } catch (err: any) {
            console.error(
                "Delete site error:",
                err
            );

            alert(
                err?.message ||
                    "Failed to delete site."
            );
        } finally {
            setDeletingSiteId(null);
        }
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>
                            Loading sites...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-8 text-white">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <h2 className="text-lg font-semibold text-red-400">
                            Unable to load sites
                        </h2>

                        <p className="mt-2 text-sm text-red-300/80">
                            {error}
                        </p>

                        <button
                            onClick={loadData}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       MAIN UI
    ========================================================= */

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="mb-8">
                    <Link
                        href={`/DriWE-Construction/projects/${projectId}`}
                        className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Project
                    </Link>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-yellow-400">
                                <Building2 className="h-5 w-5" />

                                <span className="text-sm font-medium uppercase tracking-wider">
                                    Project Sites
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                {project?.projectName ||
                                    "Project"}
                            </h1>

                            {project?.location && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                                    <MapPin className="h-4 w-4" />

                                    <span>
                                        {
                                            project.location
                                        }
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={loadData}
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>

                            <Link
                                href={`/DriWE-Construction/projects/${projectId}/sites/new`}
                                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                            >
                                <Plus className="h-4 w-4" />
                                Add Site
                            </Link>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    SUMMARY
                ===================================================== */}

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Total Sites
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {sites.length}
                                </p>
                            </div>

                            <div className="rounded-xl bg-yellow-500/10 p-3">
                                <Building2 className="h-6 w-6 text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Active Sites
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {
                                        sites.filter(
                                            (site) =>
                                                site.active
                                        ).length
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-500/10 p-3">
                                <Building2 className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">
                                    Workers
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {sites.reduce(
                                        (
                                            total,
                                            site
                                        ) =>
                                            total +
                                            Number(
                                                site.workerCount ||
                                                    0
                                            ),
                                        0
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-500/10 p-3">
                                <Users className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    EMPTY STATE
                ===================================================== */}

                {sites.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10">
                            <Building2 className="h-8 w-8 text-yellow-400" />
                        </div>

                        <h2 className="mt-5 text-xl font-semibold">
                            No sites added yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                            Add the first site for this
                            project. Workers will be
                            assigned under their
                            respective site.
                        </p>

                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/new`}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                        >
                            <Plus className="h-4 w-4" />
                            Add First Site
                        </Link>
                    </div>
                ) : (
                    /* =================================================
                       SITE CARDS
                    ================================================= */

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {sites.map(
                            (site, index) => (
                                <div
                                    key={
                                        site.siteId
                                    }
                                    className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition hover:border-yellow-500/30 hover:bg-zinc-900"
                                >
                                    {/* Top accent */}
                                    <div className="h-1 bg-gradient-to-r from-yellow-500/80 via-yellow-400/30 to-transparent" />

                                    <div className="p-5">
                                        {/* Site header */}

                                        <div className="flex items-start justify-between gap-4">
                                            <Link
                                                href={`/DriWE-Construction/projects/${projectId}/sites/${site.siteId}`}
                                                className="min-w-0 flex-1"
                                            >
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                                                        <Building2 className="h-5 w-5 text-yellow-400" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                                                            Site{" "}
                                                            {index +
                                                                1}
                                                        </p>

                                                        <h2 className="truncate text-lg font-semibold text-white transition group-hover:text-yellow-400">
                                                            {
                                                                site.siteName
                                                            }
                                                        </h2>
                                                    </div>
                                                </div>
                                            </Link>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    site.active
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-zinc-800 text-zinc-500"
                                                }`}
                                            >
                                                {site.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>

                                        {/* Location */}

                                        <div className="mt-4 flex items-start gap-2 text-sm text-zinc-400">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                                            <span className="line-clamp-2">
                                                {site.location ||
                                                    "No location specified"}
                                            </span>
                                        </div>

                                        {/* Workers */}

                                        <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-400" />

                                                <span className="text-sm text-zinc-400">
                                                    Workers
                                                </span>
                                            </div>

                                            <span className="text-sm font-semibold text-white">
                                                {site.workerCount ??
                                                    0}
                                            </span>
                                        </div>

                                        {/* Actions */}

                                        <div className="mt-5 flex items-center gap-2">
                                            <Link
                                                href={`/DriWE-Construction/projects/${projectId}/sites/${site.siteId}`}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-3 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open Site
                                            </Link>

                                            <Link
                                                href={`/DriWE-Construction/projects/${projectId}/sites/${site.siteId}/edit`}
                                                className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                                                title="Edit Site"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteSite(
                                                        site
                                                    )
                                                }
                                                disabled={
                                                    deletingSiteId ===
                                                    site.siteId
                                                }
                                                className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                title="Delete Site"
                                            >
                                                {deletingSiteId ===
                                                site.siteId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}