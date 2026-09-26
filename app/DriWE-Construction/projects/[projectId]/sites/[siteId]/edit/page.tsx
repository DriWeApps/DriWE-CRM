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
};

type Project = {
    projectId: string;
    projectName: string;
    location?: string;
};

export default function EditSitePage() {
    const params = useParams();
    const router = useRouter();

    const projectId =
        params?.projectId as string;

    const siteId =
        params?.siteId as string;

    const [site, setSite] =
        useState<Site | null>(null);

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

    const [success, setSuccess] =
        useState("");

    /* =========================================================
       LOAD SITE
    ========================================================= */

    async function loadSite() {
        if (!projectId || !siteId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                siteResponse,
                projectResponse,
            ] = await Promise.all([
                fetch(
                    `/api/construction/sites/${siteId}`,
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    `/api/construction/projects/${projectId}`,
                    {
                        cache: "no-store",
                    }
                ),
            ]);

            const siteData =
                await siteResponse.json();

            const projectData =
                await projectResponse.json();

            if (!siteResponse.ok) {
                throw new Error(
                    siteData?.message ||
                        "Failed to load site."
                );
            }

            if (!projectResponse.ok) {
                throw new Error(
                    projectData?.message ||
                        "Failed to load project."
                );
            }

            const loadedSite =
                siteData.site;

            if (!loadedSite) {
                throw new Error(
                    "Site was not found."
                );
            }

            setSite(loadedSite);

            setProject(
                projectData.project ||
                    null
            );

            setSiteName(
                loadedSite.siteName ||
                    ""
            );

            setLocation(
                loadedSite.location ||
                    ""
            );

            setActive(
                loadedSite.active !==
                    false
            );
        } catch (err: any) {
            console.error(
                "Load site error:",
                err
            );

            setError(
                err?.message ||
                    "Failed to load site."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSite();
    }, [projectId, siteId]);

    /* =========================================================
       UPDATE SITE
    ========================================================= */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

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

        try {
            setSaving(true);

            const response =
                await fetch(
                    `/api/construction/sites/${siteId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
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
                        "Failed to update site."
                );
            }

            setSuccess(
                "Site updated successfully."
            );

            /*
             * Give the user a moment to see
             * the success message, then return
             * to the site details page.
             */
            setTimeout(() => {
                router.push(
                    `/DriWE-Construction/projects/${projectId}/sites/${siteId}`
                );

                router.refresh();
            }, 700);
        } catch (err: any) {
            console.error(
                "Update site error:",
                err
            );

            setError(
                err?.message ||
                    "Failed to update site."
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
                            Loading site...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR / SITE NOT FOUND
    ========================================================= */

    if (!site) {
        return (
            <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href={`/DriWE-Construction/projects/${projectId}/sites`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sites
                    </Link>

                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <h2 className="text-lg font-semibold text-red-400">
                            Unable to load site
                        </h2>

                        <p className="mt-2 text-sm text-red-300/80">
                            {error ||
                                "Site not found."}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadSite
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
                    href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}`}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Site
                </Link>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-yellow-400">
                        <Building2 className="h-5 w-5" />

                        <span className="text-sm font-medium uppercase tracking-wider">
                            Edit Site
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Edit {site.siteName}
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Update the information for
                        this construction site.
                    </p>

                    {project && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                            <Building2 className="h-4 w-4 text-zinc-600" />

                            <span>
                                Project:
                            </span>

                            <span className="font-medium text-zinc-300">
                                {
                                    project.projectName
                                }
                            </span>
                        </div>
                    )}
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
                            Update the basic details of
                            this site.
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
                            SUCCESS
                        ========================================= */}

                        {success && (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                                <p className="text-sm text-emerald-400">
                                    {success}
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
                                    placeholder="Enter site name"
                                    disabled={
                                        saving
                                    }
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
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
                                    placeholder="Enter site location"
                                    rows={4}
                                    disabled={
                                        saving
                                    }
                                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {/* =========================================
                            ACTIVE STATUS
                        ========================================= */}

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <div className="flex items-center justify-between gap-5">
                                <div>
                                    <p className="text-sm font-medium text-zinc-300">
                                        Site Status
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Inactive sites will
                                        remain in the project
                                        but will not be treated
                                        as active sites.
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
                            PROJECT INFORMATION
                        ========================================= */}

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-yellow-500/10 p-2">
                                    <Building2 className="h-4 w-4 text-yellow-400" />
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Project
                                    </p>

                                    <p className="mt-1 font-medium text-zinc-300">
                                        {project?.projectName ||
                                            site.projectName ||
                                            "Current Project"}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        The site remains
                                        associated with this
                                        project.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =============================================
                        FORM ACTIONS
                    ============================================= */}

                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 p-6 sm:flex-row sm:justify-end">
                        <Link
                            href={`/DriWE-Construction/projects/${projectId}/sites/${siteId}`}
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
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}