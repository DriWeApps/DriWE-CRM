"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    ArrowLeft,
    Building2,
    Loader2,
    MapPin,
    Save,
} from "lucide-react";

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
    projectManager?: string;
    projectManagerName?: string;
    siteSupervisor?: string;
    siteSupervisorName?: string;
    startDate?: string;
    expectedCompletion?: string;
    status?: string;
};

export default function NewSitePage() {
    const params = useParams();
    const router = useRouter();

    const projectId =
        params?.projectId as string;

    const [project, setProject] =
        useState<Project | null>(null);

    const [siteName, setSiteName] =
        useState("");

    const [location, setLocation] =
        useState("");

    const [active, setActive] =
        useState(true);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    /* =========================================================
       LOAD PROJECT
    ========================================================= */

    async function loadProject() {
        if (!projectId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    `/api/construction/projects/${projectId}`,
                    {
                        cache: "no-store",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Failed to load project."
                );
            }

            if (!data.project) {
                throw new Error(
                    "Project was not found."
                );
            }

            setProject(
                data.project
            );
        } catch (err: any) {
            console.error(
                "Load project error:",
                err
            );

            setError(
                err?.message ||
                    "Failed to load project."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProject();
    }, [projectId]);

    /* =========================================================
       CREATE SITE
    ========================================================= */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        const trimmedSiteName =
            siteName.trim();

        const trimmedLocation =
            location.trim();

        if (!trimmedSiteName) {
            setError(
                "Site name is required."
            );
            return;
        }

        if (!projectId) {
            setError(
                "Project ID is missing."
            );
            return;
        }

        try {
            setSaving(true);

            const response =
                await fetch(
                    "/api/construction/sites",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            projectId,
                            siteName:
                                trimmedSiteName,
                            location:
                                trimmedLocation,
                            active,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Failed to create site."
                );
            }

            const createdSite =
                data.site;

            if (
                createdSite?.siteId
            ) {
                router.push(
                    `/DriWE-Construction/projects/${projectId}/sites/${createdSite.siteId}`
                );
            } else {
                router.push(
                    `/DriWE-Construction/projects/${projectId}/sites`
                );
            }

            router.refresh();
        } catch (err: any) {
            console.error(
                "Create site error:",
                err
            );

            setError(
                err?.message ||
                    "Failed to create site."
            );
        } finally {
            setSaving(false);
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
                            Loading project...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       PROJECT ERROR
    ========================================================= */

    if (!project) {
        return (
            <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/DriWE-Construction/projects"
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>

                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <h2 className="text-lg font-semibold text-red-400">
                            Unable to load project
                        </h2>

                        <p className="mt-2 text-sm text-red-300/80">
                            {error ||
                                "Project not found."}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadProject
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                        >
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
            <div className="mx-auto max-w-4xl">

                {/* =================================================
                    BACK
                ================================================= */}

                <Link
                    href={`/DriWE-Construction/projects/${projectId}/sites`}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sites
                </Link>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-yellow-400">
                        <Building2 className="h-5 w-5" />

                        <span className="text-sm font-medium uppercase tracking-wider">
                            New Site
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Add New Site
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Create a new construction site
                        under this project.
                    </p>
                </div>

                {/* =================================================
                    PROJECT CARD
                ================================================= */}

                <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                            <Building2 className="h-5 w-5 text-yellow-400" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                                Project
                            </p>

                            <h2 className="mt-1 text-lg font-semibold text-white">
                                {
                                    project.projectName
                                }
                            </h2>

                            {project.location && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                    <MapPin className="h-4 w-4" />

                                    <span>
                                        {
                                            project.location
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60"
                >
                    <div className="border-b border-zinc-800 p-6">
                        <h2 className="text-lg font-semibold">
                            Site Information
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Enter the basic information
                            for this construction site.
                        </p>
                    </div>

                    <div className="space-y-6 p-6">

                        {/* =========================================
                            ERROR
                        ========================================= */}

                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* =========================================
                            SITE NAME
                        ========================================= */}

                        <div>
                            <label
                                htmlFor="siteName"
                                className="mb-2 block text-sm font-medium text-zinc-300"
                            >
                                Site Name
                                <span className="ml-1 text-red-400">
                                    *
                                </span>
                            </label>

                            <div className="relative">
                                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                                <input
                                    id="siteName"
                                    type="text"
                                    value={
                                        siteName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSiteName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. Main Construction Site"
                                    disabled={
                                        saving
                                    }
                                    autoFocus
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <p className="mt-2 text-xs text-zinc-600">
                                Give this site a clear
                                and recognizable name.
                            </p>
                        </div>

                        {/* =========================================
                            LOCATION
                        ========================================= */}

                        <div>
                            <label
                                htmlFor="location"
                                className="mb-2 block text-sm font-medium text-zinc-300"
                            >
                                Site Location
                            </label>

                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />

                                <textarea
                                    id="location"
                                    value={
                                        location
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setLocation(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Enter the site address or location"
                                    rows={4}
                                    disabled={
                                        saving
                                    }
                                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <p className="mt-2 text-xs text-zinc-600">
                                You can enter the address,
                                area, city, or any useful
                                location information.
                            </p>
                        </div>

                        {/* =========================================
                            STATUS
                        ========================================= */}

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <div className="flex items-center justify-between gap-5">
                                <div>
                                    <p className="text-sm font-medium text-zinc-300">
                                        Site Status
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        New sites are active by
                                        default.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={
                                        active
                                    }
                                    onClick={() =>
                                        setActive(
                                            (
                                                current
                                            ) =>
                                                !current
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                                        active
                                            ? "bg-yellow-500"
                                            : "bg-zinc-700"
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                                            active
                                                ? "left-6"
                                                : "left-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="mt-3">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        active
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-zinc-800 text-zinc-500"
                                    }`}
                                >
                                    {active
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>
                        </div>

                        {/* =========================================
                            HIERARCHY INFORMATION
                        ========================================= */}

                        <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/[0.03] p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-yellow-500/10 p-2">
                                    <Building2 className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-zinc-300">
                                        Project → Site →
                                        Workers
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        This site will
                                        automatically belong
                                        to{" "}
                                        <span className="text-zinc-300">
                                            {
                                                project.projectName
                                            }
                                        </span>
                                        . Workers can then be
                                        added directly under
                                        this site.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =============================================
                        ACTIONS
                    ============================================= */}

                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 p-6 sm:flex-row sm:justify-end">
                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites`}
                            className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating Site...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Site
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}