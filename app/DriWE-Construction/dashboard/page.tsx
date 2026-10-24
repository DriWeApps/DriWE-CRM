"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  FolderKanban,
  MapPin,
} from "lucide-react";

type DashboardProject = {
  projectId: string;
  projectName: string;
  location?: string;
  status?: string;
};

type DashboardResponse = {
  success?: boolean;
  projects?: DashboardProject[];
  error?: string;
  message?: string;
};

export default function ConstructionDashboardPage() {
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

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:border-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Main */}
     <main className="relative z-10 w-full px-4 py-6 sm:px-6 lg:px-8">
  <div className="w-full min-w-0">
          {/* Page Heading */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Building2 className="h-6 w-6 text-black" />
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight text-black">
                  Construction Dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Live overview of your construction operations
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className={buttonClass}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-red-800">
                  Unable to load dashboard
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                className="shrink-0 text-sm font-semibold text-red-800 underline underline-offset-4 hover:text-red-950"
              >
                Try again
              </button>
            </div>
          )}

          {/* Projects */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-black" />
                  <h3 className="font-semibold text-black">Projects</h3>
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  Your construction projects
                </p>
              </div>

              <Link
                href="/DriWE-Construction/projects"
                className={buttonClass}
              >
                View Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading && projects.length === 0 ? (
              <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-gray-600">
                <RefreshCw className="h-5 w-5 animate-spin text-black" />
                Loading projects...
              </div>
            ) : projects.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.projectId}
                    href={`/DriWE-Construction/projects/${project.projectId}`}
                    className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-black">
                        {project.projectName}
                      </p>

                      {project.location && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {project.status && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            project.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : project.status === "On Hold"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : project.status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      )}

                      <ArrowRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <FolderKanban className="h-6 w-6 text-gray-500" />
                </div>

                <h4 className="mt-4 font-medium text-black">
                  No projects available
                </h4>

                <p className="mt-1 text-sm text-gray-600">
                  Create a construction project to start managing your sites,
                  workers and tasks.
                </p>

                <Link
                  href="/DriWE-Construction/projects/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Create Project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Dashboard information is based on currently recorded construction
              projects.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
