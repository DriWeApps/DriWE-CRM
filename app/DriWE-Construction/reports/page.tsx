"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Download,
    Loader2,
    RefreshCw,
    Search,
    Users,
    Package,
    TrendingUp,
    Clock3,
    AlertTriangle,
    X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TaskStatus =
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Delayed";

type Priority =
    | "Low"
    | "Medium"
    | "High";

type AttendanceStatus =
    | "Present"
    | "Absent"
    | "Half Day";

type MaterialTransactionType =
    | "RECEIVE"
    | "ISSUE"
    | "TRANSFER";

interface Project {
    projectId: string;
    projectName: string;
    location?: string;
    status?: string;
    startDate?: string;
    expectedCompletion?: string;
}

interface Site {
    siteId: string;
    projectId: string;
    projectName?: string;
    siteName: string;
    location?: string;
    active?: boolean;
}

interface Worker {
    workerId: string;
    companyId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    name: string;
    phone: string;
    role?: string;
    workerType?: string;
    salary?: number;
    dailyWage?: number;
    active?: boolean;
}

interface ConstructionTask {
    taskId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    title: string;
    description?: string;
    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;
    priority?: Priority;
    status: TaskStatus;
    startDate?: string;
    dueDate?: string;
    completionDescription?: string;
    completionLink?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface Attendance {
    attendanceId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    workerId: string;
    workerName?: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
}

interface DailyUpdate {
    updateId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    updateDate?: string;
    date?: string;
    workDescription?: string;
    description?: string;
    createdAt?: string;
}

interface Material {
    materialId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    materialName: string;
    category?: string;
    unit: string;
    quantity: number;
    minimumStock?: number;
    unitPrice?: number;
    totalValue?: number;
    status?: string;
}

interface MaterialTransaction {
    transactionId: string;
    projectId: string;
    projectName?: string;
    siteId: string;
    siteName?: string;
    materialId: string;
    materialName?: string;
    transactionType: MaterialTransactionType;
    quantity: number;
    unit: string;
    toSiteId?: string;
    toSiteName?: string;
    createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value?: string) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
    }).format(value);
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

function getDateValue(
    item: DailyUpdate
) {
    return (
        item.updateDate ||
        item.date ||
        item.createdAt
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ConstructionReportsPage() {
    const [projects, setProjects] = useState<Project[]>(
        []
    );

    const [sites, setSites] = useState<Site[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [tasks, setTasks] = useState<ConstructionTask[]>(
        []
    );
    const [attendance, setAttendance] = useState<
        Attendance[]
    >([]);
    const [dailyUpdates, setDailyUpdates] = useState<
        DailyUpdate[]
    >([]);
    const [materials, setMaterials] = useState<Material[]>(
        []
    );
    const [
        materialTransactions,
        setMaterialTransactions,
    ] = useState<MaterialTransaction[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedProject, setSelectedProject] =
        useState("All");

    const [selectedSite, setSelectedSite] =
        useState("All");

    const [search, setSearch] = useState("");

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [activeSection, setActiveSection] =
        useState<
            | "overview"
            | "tasks"
            | "attendance"
            | "materials"
            | "updates"
        >("overview");

    /* ---------------------------------------------------------------------- */
    /* Generic fetch helper                                                   */
    /* ---------------------------------------------------------------------- */

    async function fetchData<T>(
        url: string
    ): Promise<T[]> {
        const response = await fetch(url, {
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(
                `Failed to load ${url}`
            );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data.projects)) {
            return data.projects;
        }

        if (Array.isArray(data.sites)) {
            return data.sites;
        }

        if (Array.isArray(data.workers)) {
            return data.workers;
        }

        if (Array.isArray(data.tasks)) {
            return data.tasks;
        }

        if (Array.isArray(data.attendance)) {
            return data.attendance;
        }

        if (Array.isArray(data.updates)) {
            return data.updates;
        }

        if (Array.isArray(data.dailyUpdates)) {
            return data.dailyUpdates;
        }

        if (Array.isArray(data.materials)) {
            return data.materials;
        }

        if (
            Array.isArray(
                data.transactions
            )
        ) {
            return data.transactions;
        }

        return [];
    }

    /* ---------------------------------------------------------------------- */
    /* Load all report data                                                   */
    /* ---------------------------------------------------------------------- */

    async function loadReports() {
        try {
            setLoading(true);
            setError("");

            const results =
                await Promise.allSettled([
                    fetchData<Project>(
                        "/api/construction/projects"
                    ),

                    fetchData<Site>(
                        "/api/construction/sites"
                    ),

                    fetchData<Worker>(
                        "/api/construction/workers"
                    ),

                    fetchData<ConstructionTask>(
                        "/api/construction/tasks"
                    ),

                    fetchData<Attendance>(
                        "/api/construction/attendance"
                    ),

                    fetchData<DailyUpdate>(
                        "/api/construction/daily-updates"
                    ),

                    fetchData<Material>(
                        "/api/construction/materials"
                    ),

                    fetchData<MaterialTransaction>(
                        "/api/construction/material-transactions"
                    ),
                ]);

            const [
                projectResult,
                siteResult,
                workerResult,
                taskResult,
                attendanceResult,
                updateResult,
                materialResult,
                transactionResult,
            ] = results;

            if (
                projectResult.status ===
                "fulfilled"
            ) {
                setProjects(
                    projectResult.value
                );
            }

            if (
                siteResult.status ===
                "fulfilled"
            ) {
                setSites(
                    siteResult.value
                );
            }

            if (
                workerResult.status ===
                "fulfilled"
            ) {
                setWorkers(
                    workerResult.value
                );
            }

            if (
                taskResult.status ===
                "fulfilled"
            ) {
                setTasks(
                    taskResult.value
                );
            }

            if (
                attendanceResult.status ===
                "fulfilled"
            ) {
                setAttendance(
                    attendanceResult.value
                );
            }

            if (
                updateResult.status ===
                "fulfilled"
            ) {
                setDailyUpdates(
                    updateResult.value
                );
            }

            if (
                materialResult.status ===
                "fulfilled"
            ) {
                setMaterials(
                    materialResult.value
                );
            }

            if (
                transactionResult.status ===
                "fulfilled"
            ) {
                setMaterialTransactions(
                    transactionResult.value
                );
            }

            const failedCount =
                results.filter(
                    (result) =>
                        result.status ===
                        "rejected"
                ).length;

            if (failedCount > 0) {
                setError(
                    `${failedCount} report data source${
                        failedCount > 1
                            ? "s"
                            : ""
                    } could not be loaded.`
                );
            }
        } catch (err) {
            console.error(
                "Construction reports error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load reports"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReports();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Filter sites                                                           */
    /* ---------------------------------------------------------------------- */

    const filteredSites = useMemo(() => {
        if (
            selectedProject ===
            "All"
        ) {
            return sites;
        }

        return sites.filter(
            (site) =>
                site.projectId ===
                selectedProject
        );
    }, [
        sites,
        selectedProject,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Filter report data                                                     */
    /* ---------------------------------------------------------------------- */

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const projectMatch =
                selectedProject ===
                    "All" ||
                task.projectId ===
                    selectedProject;

            const siteMatch =
                selectedSite === "All" ||
                task.siteId ===
                    selectedSite;

            const searchMatch =
                !search.trim() ||
                task.title
                    .toLowerCase()
                    .includes(
                        search
                            .trim()
                            .toLowerCase()
                    ) ||
                task.projectName
                    ?.toLowerCase()
                    .includes(
                        search
                            .trim()
                            .toLowerCase()
                    ) ||
                task.siteName
                    ?.toLowerCase()
                    .includes(
                        search
                            .trim()
                            .toLowerCase()
                    ) ||
                task.assignedToName
                    ?.toLowerCase()
                    .includes(
                        search
                            .trim()
                            .toLowerCase()
                    );

            const dateMatch =
                (!dateFrom ||
                    !task.createdAt ||
                    task.createdAt.slice(
                        0,
                        10
                    ) >= dateFrom) &&
                (!dateTo ||
                    !task.createdAt ||
                    task.createdAt.slice(
                        0,
                        10
                    ) <= dateTo);

            return (
                projectMatch &&
                siteMatch &&
                searchMatch &&
                dateMatch
            );
        });
    }, [
        tasks,
        selectedProject,
        selectedSite,
        search,
        dateFrom,
        dateTo,
    ]);

    const filteredAttendance =
        useMemo(() => {
            return attendance.filter(
                (item) => {
                    const projectMatch =
                        selectedProject ===
                            "All" ||
                        item.projectId ===
                            selectedProject;

                    const siteMatch =
                        selectedSite ===
                            "All" ||
                        item.siteId ===
                            selectedSite;

                    const date =
                        item.date?.slice(
                            0,
                            10
                        );

                    const dateMatch =
                        (!dateFrom ||
                            !date ||
                            date >=
                                dateFrom) &&
                        (!dateTo ||
                            !date ||
                            date <=
                                dateTo);

                    const searchMatch =
                        !search.trim() ||
                        item.workerName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        item.projectName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        item.siteName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            );

                    return (
                        projectMatch &&
                        siteMatch &&
                        dateMatch &&
                        searchMatch
                    );
                }
            );
        }, [
            attendance,
            selectedProject,
            selectedSite,
            search,
            dateFrom,
            dateTo,
        ]);

    const filteredWorkers =
        useMemo(() => {
            return workers.filter(
                (worker) => {
                    const projectMatch =
                        selectedProject ===
                            "All" ||
                        worker.projectId ===
                            selectedProject;

                    const siteMatch =
                        selectedSite ===
                            "All" ||
                        worker.siteId ===
                            selectedSite;

                    const searchMatch =
                        !search.trim() ||
                        worker.name
                            .toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        worker.siteName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            );

                    return (
                        projectMatch &&
                        siteMatch &&
                        searchMatch
                    );
                }
            );
        }, [
            workers,
            selectedProject,
            selectedSite,
            search,
        ]);

    const filteredMaterials =
        useMemo(() => {
            return materials.filter(
                (material) => {
                    const projectMatch =
                        selectedProject ===
                            "All" ||
                        material.projectId ===
                            selectedProject;

                    const siteMatch =
                        selectedSite ===
                            "All" ||
                        material.siteId ===
                            selectedSite;

                    const searchMatch =
                        !search.trim() ||
                        material.materialName
                            .toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        material.projectName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        material.siteName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            );

                    return (
                        projectMatch &&
                        siteMatch &&
                        searchMatch
                    );
                }
            );
        }, [
            materials,
            selectedProject,
            selectedSite,
            search,
        ]);

    const filteredUpdates =
        useMemo(() => {
            return dailyUpdates.filter(
                (update) => {
                    const projectMatch =
                        selectedProject ===
                            "All" ||
                        update.projectId ===
                            selectedProject;

                    const siteMatch =
                        selectedSite ===
                            "All" ||
                        update.siteId ===
                            selectedSite;

                    const updateDate =
                        getDateValue(
                            update
                        )?.slice(
                            0,
                            10
                        );

                    const dateMatch =
                        (!dateFrom ||
                            !updateDate ||
                            updateDate >=
                                dateFrom) &&
                        (!dateTo ||
                            !updateDate ||
                            updateDate <=
                                dateTo);

                    const searchMatch =
                        !search.trim() ||
                        update.projectName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        update.siteName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        update.workDescription
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        update.description
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            );

                    return (
                        projectMatch &&
                        siteMatch &&
                        dateMatch &&
                        searchMatch
                    );
                }
            );
        }, [
            dailyUpdates,
            selectedProject,
            selectedSite,
            search,
            dateFrom,
            dateTo,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Filter material transactions                                           */
    /* ---------------------------------------------------------------------- */

    const filteredTransactions =
        useMemo(() => {
            return materialTransactions.filter(
                (transaction) => {
                    const projectMatch =
                        selectedProject ===
                            "All" ||
                        transaction.projectId ===
                            selectedProject;

                    const siteMatch =
                        selectedSite ===
                            "All" ||
                        transaction.siteId ===
                            selectedSite ||
                        transaction.toSiteId ===
                            selectedSite;

                    const date =
                        transaction.createdAt?.slice(
                            0,
                            10
                        );

                    const dateMatch =
                        (!dateFrom ||
                            !date ||
                            date >=
                                dateFrom) &&
                        (!dateTo ||
                            !date ||
                            date <=
                                dateTo);

                    const searchMatch =
                        !search.trim() ||
                        transaction.materialName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            ) ||
                        transaction.siteName
                            ?.toLowerCase()
                            .includes(
                                search
                                    .trim()
                                    .toLowerCase()
                            );

                    return (
                        projectMatch &&
                        siteMatch &&
                        dateMatch &&
                        searchMatch
                    );
                }
            );
        }, [
            materialTransactions,
            selectedProject,
            selectedSite,
            dateFrom,
            dateTo,
            search,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Overview statistics                                                    */
    /* ---------------------------------------------------------------------- */

    const statistics = useMemo(() => {
        const totalTasks =
            filteredTasks.length;

        const completedTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "Completed"
            ).length;

        const pendingTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "Pending"
            ).length;

        const inProgressTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "In Progress"
            ).length;

        const delayedTasks =
            filteredTasks.filter(
                (task) =>
                    task.status ===
                    "Delayed"
            ).length;

        const present =
            filteredAttendance.filter(
                (item) =>
                    item.status ===
                    "Present"
            ).length;

        const absent =
            filteredAttendance.filter(
                (item) =>
                    item.status ===
                    "Absent"
            ).length;

        const halfDay =
            filteredAttendance.filter(
                (item) =>
                    item.status ===
                    "Half Day"
            ).length;

        const totalAttendance =
            filteredAttendance.length;

        const attendancePercentage =
            totalAttendance > 0
                ? Math.round(
                      (present /
                          totalAttendance) *
                          100
                  )
                : 0;

        const stockValue =
            filteredMaterials.reduce(
                (sum, material) =>
                    sum +
                    Number(
                        material.totalValue ||
                            Number(
                                material.quantity ||
                                    0
                            ) *
                                Number(
                                    material.unitPrice ||
                                        0
                                )
                    ),
                0
            );

        const lowStock =
            filteredMaterials.filter(
                (material) =>
                    material.minimumStock !==
                        undefined &&
                    Number(
                        material.quantity
                    ) <=
                        Number(
                            material.minimumStock
                        )
            ).length;

        const received =
            filteredTransactions
                .filter(
                    (item) =>
                        item.transactionType ===
                        "RECEIVE"
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.quantity || 0
                        ),
                    0
                );

        const issued =
            filteredTransactions
                .filter(
                    (item) =>
                        item.transactionType ===
                        "ISSUE"
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.quantity || 0
                        ),
                    0
                );

        const transferred =
            filteredTransactions
                .filter(
                    (item) =>
                        item.transactionType ===
                        "TRANSFER"
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.quantity || 0
                        ),
                    0
                );

        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            delayedTasks,
            present,
            absent,
            halfDay,
            totalAttendance,
            attendancePercentage,
            stockValue,
            lowStock,
            received,
            issued,
            transferred,
        };
    }, [
        filteredTasks,
        filteredAttendance,
        filteredMaterials,
        filteredTransactions,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Project summary                                                        */
    /* ---------------------------------------------------------------------- */

    const projectSummary =
        useMemo(() => {
            const source =
                selectedProject === "All"
                    ? projects
                    : projects.filter(
                          (project) =>
                              project.projectId ===
                              selectedProject
                      );

            return source.map(
                (project) => {
                    const projectTasks =
                        tasks.filter(
                            (task) =>
                                task.projectId ===
                                project.projectId
                        );

                    const projectWorkers =
                        workers.filter(
                            (worker) =>
                                worker.projectId ===
                                project.projectId
                        );

                    const projectSites =
                        sites.filter(
                            (site) =>
                                site.projectId ===
                                project.projectId
                        );

                    const completed =
                        projectTasks.filter(
                            (task) =>
                                task.status ===
                                "Completed"
                        ).length;

                    return {
                        ...project,
                        sites:
                            projectSites.length,
                        workers:
                            projectWorkers.length,
                        tasks:
                            projectTasks.length,
                        completed,
                        completionPercentage:
                            projectTasks.length >
                            0
                                ? Math.round(
                                      (completed /
                                          projectTasks.length) *
                                          100
                                  )
                                : 0,
                    };
                }
            );
        }, [
            projects,
            tasks,
            workers,
            sites,
            selectedProject,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Export CSV                                                             */
    /* ---------------------------------------------------------------------- */

    function downloadCSV(
        filename: string,
        rows: Record<
            string,
            string | number
        >[]
    ) {
        if (rows.length === 0) {
            setError(
                "There is no data to export."
            );
            return;
        }

        const headers = Object.keys(
            rows[0]
        );

        const escapeCSV = (
            value: string | number
        ) => {
            const stringValue =
                String(value);

            return `"${stringValue.replace(
                /"/g,
                '""'
            )}"`;
        };

        const csv = [
            headers
                .map(escapeCSV)
                .join(","),
            ...rows.map((row) =>
                headers
                    .map((header) =>
                        escapeCSV(
                            row[header] ??
                                ""
                        )
                    )
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function exportTasks() {
        downloadCSV(
            "construction-tasks.csv",
            filteredTasks.map(
                (task) => ({
                    Task:
                        task.title,
                    Project:
                        task.projectName ||
                        "",
                    Site:
                        task.siteName ||
                        "",
                    AssignedTo:
                        task.assignedToName ||
                        task.assignedToEmail ||
                        "",
                    Priority:
                        task.priority ||
                        "",
                    Status:
                        task.status,
                    StartDate:
                        task.startDate ||
                        "",
                    DueDate:
                        task.dueDate ||
                        "",
                })
            )
        );
    }

    function exportAttendance() {
        downloadCSV(
            "construction-attendance.csv",
            filteredAttendance.map(
                (item) => ({
                    Date:
                        item.date ||
                        "",
                    Worker:
                        item.workerName ||
                        "",
                    Project:
                        item.projectName ||
                        "",
                    Site:
                        item.siteName ||
                        "",
                    Status:
                        item.status,
                    Remarks:
                        item.remarks ||
                        "",
                })
            )
        );
    }

    function exportMaterials() {
        downloadCSV(
            "construction-materials.csv",
            filteredMaterials.map(
                (material) => ({
                    Material:
                        material.materialName,
                    Project:
                        material.projectName ||
                        "",
                    Site:
                        material.siteName ||
                        "",
                    Unit:
                        material.unit,
                    Quantity:
                        material.quantity,
                    MinimumStock:
                        material.minimumStock ??
                        "",
                    UnitPrice:
                        material.unitPrice ??
                        "",
                    TotalValue:
                        material.totalValue ??
                        "",
                    Status:
                        material.status ||
                        "",
                })
            )
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* ---------------------------------------------------------------- */}
            {/* Header                                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="border-b border-zinc-800 bg-zinc-950/95">
                <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <Link
                                href="/DriWE-Construction"
                                className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-yellow-400"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Construction
                            </Link>

                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Construction Reports
                                    </h1>

                                    <p className="text-sm text-zinc-400">
                                        Project, workforce,
                                        task, attendance and
                                        material reports
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                loadReports()
                            }
                            disabled={loading}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            Refresh Reports
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                {/* ---------------------------------------------------------------- */}
                {/* Alerts                                                           */}
                {/* ---------------------------------------------------------------- */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="flex-1">
                            {error}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        <CheckCircle2 className="h-5 w-5" />

                        <span>
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            className="ml-auto"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* ---------------------------------------------------------------- */}
                {/* Filters                                                          */}
                {/* ---------------------------------------------------------------- */}

                <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                        <Search className="h-4 w-4 text-yellow-400" />
                        Report Filters
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <select
                            value={
                                selectedProject
                            }
                            onChange={(event) => {
                                setSelectedProject(
                                    event.target
                                        .value
                                );
                                setSelectedSite(
                                    "All"
                                );
                            }}
                            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-yellow-400"
                        >
                            <option value="All">
                                All Projects
                            </option>

                            {projects.map(
                                (project) => (
                                    <option
                                        key={
                                            project.projectId
                                        }
                                        value={
                                            project.projectId
                                        }
                                    >
                                        {
                                            project.projectName
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        <select
                            value={
                                selectedSite
                            }
                            onChange={(event) =>
                                setSelectedSite(
                                    event.target
                                        .value
                                )
                            }
                            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-yellow-400"
                        >
                            <option value="All">
                                All Sites
                            </option>

                            {filteredSites.map(
                                (site) => (
                                    <option
                                        key={
                                            site.siteId
                                        }
                                        value={
                                            site.siteId
                                        }
                                    >
                                        {
                                            site.siteName
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search..."
                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400"
                            />
                        </div>

                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(
                                        event.target
                                            .value
                                    )
                                }
                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none focus:border-yellow-400"
                            />
                        </div>

                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(
                                        event.target
                                            .value
                                    )
                                }
                                className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none focus:border-yellow-400"
                            />
                        </div>
                    </div>
                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Navigation                                                       */}
                {/* ---------------------------------------------------------------- */}

                <div className="mb-6 flex flex-wrap gap-2">
                    {[
                        {
                            id: "overview",
                            label: "Overview",
                        },
                        {
                            id: "tasks",
                            label: "Tasks",
                        },
                        {
                            id: "attendance",
                            label: "Attendance",
                        },
                        {
                            id: "materials",
                            label: "Materials",
                        },
                        {
                            id: "updates",
                            label: "Daily Updates",
                        },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                                setActiveSection(
                                    item.id as typeof activeSection
                                )
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeSection ===
                                item.id
                                    ? "bg-yellow-400 text-black"
                                    : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="flex items-center gap-3 text-zinc-400">
                            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
                            Loading construction reports...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ======================================================== */}
                        {/* OVERVIEW                                                  */}
                        {/* ======================================================== */}

                        {activeSection ===
                            "overview" && (
                            <div className="space-y-6">
                                {/* Statistics */}

                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                                    <ReportCard
                                        label="Projects"
                                        value={
                                            selectedProject ===
                                            "All"
                                                ? projects.length
                                                : 1
                                        }
                                        icon={
                                            <Building2 className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Sites"
                                        value={
                                            selectedProject ===
                                            "All"
                                                ? sites.length
                                                : filteredSites.length
                                        }
                                        icon={
                                            <Building2 className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Workers"
                                        value={
                                            filteredWorkers.length
                                        }
                                        icon={
                                            <Users className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Tasks"
                                        value={
                                            statistics.totalTasks
                                        }
                                        icon={
                                            <ClipboardList className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Completed"
                                        value={
                                            statistics.completedTasks
                                        }
                                        icon={
                                            <CheckCircle2 className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Attendance"
                                        value={`${statistics.attendancePercentage}%`}
                                        icon={
                                            <TrendingUp className="h-5 w-5" />
                                        }
                                    />
                                </div>

                                {/* Task / attendance / materials */}

                                <div className="grid gap-6 lg:grid-cols-3">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    Task Summary
                                                </h3>

                                                <p className="text-xs text-zinc-500">
                                                    Current task status
                                                </p>
                                            </div>

                                            <ClipboardList className="h-5 w-5 text-yellow-400" />
                                        </div>

                                        <div className="space-y-4">
                                            <ProgressRow
                                                label="Completed"
                                                value={
                                                    statistics.completedTasks
                                                }
                                                total={
                                                    statistics.totalTasks
                                                }
                                            />

                                            <ProgressRow
                                                label="In Progress"
                                                value={
                                                    statistics.inProgressTasks
                                                }
                                                total={
                                                    statistics.totalTasks
                                                }
                                            />

                                            <ProgressRow
                                                label="Pending"
                                                value={
                                                    statistics.pendingTasks
                                                }
                                                total={
                                                    statistics.totalTasks
                                                }
                                            />

                                            <ProgressRow
                                                label="Delayed"
                                                value={
                                                    statistics.delayedTasks
                                                }
                                                total={
                                                    statistics.totalTasks
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    Attendance
                                                </h3>

                                                <p className="text-xs text-zinc-500">
                                                    Selected period
                                                </p>
                                            </div>

                                            <Users className="h-5 w-5 text-yellow-400" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <MiniStat
                                                label="Present"
                                                value={
                                                    statistics.present
                                                }
                                            />

                                            <MiniStat
                                                label="Absent"
                                                value={
                                                    statistics.absent
                                                }
                                            />

                                            <MiniStat
                                                label="Half Day"
                                                value={
                                                    statistics.halfDay
                                                }
                                            />
                                        </div>

                                        <div className="mt-6">
                                            <div className="mb-2 flex items-center justify-between text-xs">
                                                <span className="text-zinc-500">
                                                    Attendance
                                                    Rate
                                                </span>

                                                <span className="font-semibold text-white">
                                                    {
                                                        statistics.attendancePercentage
                                                    }
                                                    %
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                                <div
                                                    className="h-full rounded-full bg-yellow-400 transition-all"
                                                    style={{
                                                        width: `${statistics.attendancePercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    Materials
                                                </h3>

                                                <p className="text-xs text-zinc-500">
                                                    Current stock
                                                </p>
                                            </div>

                                            <Package className="h-5 w-5 text-yellow-400" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <MiniStat
                                                label="Items"
                                                value={
                                                    filteredMaterials.length
                                                }
                                            />

                                            <MiniStat
                                                label="Low Stock"
                                                value={
                                                    statistics.lowStock
                                                }
                                            />

                                            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                                <div className="text-xs text-zinc-500">
                                                    Stock Value
                                                </div>

                                                <div className="mt-1 text-lg font-semibold text-white">
                                                    {formatCurrency(
                                                        statistics.stockValue
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                                <div className="text-xs text-zinc-500">
                                                    Transactions
                                                </div>

                                                <div className="mt-1 text-lg font-semibold text-white">
                                                    {
                                                        filteredTransactions.length
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Material movement */}

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                Material Movement
                                            </h3>

                                            <p className="text-xs text-zinc-500">
                                                Based on selected
                                                filters
                                            </p>
                                        </div>

                                        <Package className="h-5 w-5 text-yellow-400" />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <MovementCard
                                            label="Received"
                                            value={
                                                statistics.received
                                            }
                                            icon="+"
                                        />

                                        <MovementCard
                                            label="Issued"
                                            value={
                                                statistics.issued
                                            }
                                            icon="-"
                                        />

                                        <MovementCard
                                            label="Transferred"
                                            value={
                                                statistics.transferred
                                            }
                                            icon="↔"
                                        />
                                    </div>
                                </div>

                                {/* Project summary */}

                                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
                                    <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                                        <div>
                                            <h3 className="font-semibold">
                                                Project Summary
                                            </h3>

                                            <p className="text-xs text-zinc-500">
                                                Project-level
                                                construction
                                                overview
                                            </p>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[850px] text-left">
                                            <thead>
                                                <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase tracking-wide text-zinc-500">
                                                    <th className="px-5 py-3">
                                                        Project
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Sites
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Workers
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Tasks
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Completed
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Progress
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-zinc-800">
                                                {projectSummary.map(
                                                    (
                                                        project
                                                    ) => (
                                                        <tr
                                                            key={
                                                                project.projectId
                                                            }
                                                            className="hover:bg-zinc-800/30"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="font-medium text-white">
                                                                    {
                                                                        project.projectName
                                                                    }
                                                                </div>

                                                                <div className="mt-1 text-xs text-zinc-500">
                                                                    {
                                                                        project.location
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300">
                                                                    {project.status ||
                                                                        "-"}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                                {
                                                                    project.sites
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                                {
                                                                    project.workers
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                                {
                                                                    project.tasks
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                                {
                                                                    project.completed
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                                                                        <div
                                                                            className="h-full rounded-full bg-yellow-400"
                                                                            style={{
                                                                                width: `${project.completionPercentage}%`,
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <span className="text-xs text-zinc-400">
                                                                        {
                                                                            project.completionPercentage
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}

                                                {projectSummary.length ===
                                                    0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={
                                                                7
                                                            }
                                                            className="px-5 py-10 text-center text-sm text-zinc-500"
                                                        >
                                                            No
                                                            projects
                                                            found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TASKS                                                     */}
                        {/* ======================================================== */}

                        {activeSection ===
                            "tasks" && (
                            <ReportTableCard
                                title="Task Report"
                                description={`${filteredTasks.length} tasks found`}
                                exportLabel="Export Tasks"
                                onExport={
                                    exportTasks
                                }
                            >
                                <table className="w-full min-w-[950px] text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-500">
                                            <th className="px-5 py-3">
                                                Task
                                            </th>

                                            <th className="px-5 py-3">
                                                Project
                                            </th>

                                            <th className="px-5 py-3">
                                                Site
                                            </th>

                                            <th className="px-5 py-3">
                                                Assigned To
                                            </th>

                                            <th className="px-5 py-3">
                                                Priority
                                            </th>

                                            <th className="px-5 py-3">
                                                Status
                                            </th>

                                            <th className="px-5 py-3">
                                                Due
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredTasks.map(
                                            (task) => (
                                                <tr
                                                    key={
                                                        task.taskId
                                                    }
                                                    className="hover:bg-zinc-800/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-white">
                                                            {
                                                                task.title
                                                            }
                                                        </div>

                                                        {task.description && (
                                                            <div className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                                                {
                                                                    task.description
                                                                }
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {
                                                            task.projectName
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {
                                                            task.siteName
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {task.assignedToName ||
                                                            task.assignedToEmail ||
                                                            "Unassigned"}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`text-sm font-medium ${
                                                                task.priority ===
                                                                "High"
                                                                    ? "text-red-400"
                                                                    : task.priority ===
                                                                      "Medium"
                                                                    ? "text-yellow-400"
                                                                    : "text-green-400"
                                                            }`}
                                                        >
                                                            {task.priority ||
                                                                "Medium"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300">
                                                            {
                                                                task.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-400">
                                                        {formatDate(
                                                            task.dueDate
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                        {filteredTasks.length ===
                                            0 && (
                                            <EmptyTableRow
                                                colSpan={
                                                    7
                                                }
                                            />
                                        )}
                                    </tbody>
                                </table>
                            </ReportTableCard>
                        )}

                        {/* ======================================================== */}
                        {/* ATTENDANCE                                                */}
                        {/* ======================================================== */}

                        {activeSection ===
                            "attendance" && (
                            <ReportTableCard
                                title="Attendance Report"
                                description={`${filteredAttendance.length} attendance records found`}
                                exportLabel="Export Attendance"
                                onExport={
                                    exportAttendance
                                }
                            >
                                <table className="w-full min-w-[900px] text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-500">
                                            <th className="px-5 py-3">
                                                Date
                                            </th>

                                            <th className="px-5 py-3">
                                                Worker
                                            </th>

                                            <th className="px-5 py-3">
                                                Project
                                            </th>

                                            <th className="px-5 py-3">
                                                Site
                                            </th>

                                            <th className="px-5 py-3">
                                                Status
                                            </th>

                                            <th className="px-5 py-3">
                                                Remarks
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredAttendance.map(
                                            (
                                                item
                                            ) => (
                                                <tr
                                                    key={
                                                        item.attendanceId
                                                    }
                                                    className="hover:bg-zinc-800/30"
                                                >
                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {formatDate(
                                                            item.date
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-white">
                                                            {
                                                                item.workerName
                                                            }
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {
                                                            item.projectName
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {
                                                            item.siteName
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-xs ${
                                                                item.status ===
                                                                "Present"
                                                                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                                                                    : item.status ===
                                                                      "Absent"
                                                                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                                                                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                                                            }`}
                                                        >
                                                            {
                                                                item.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-500">
                                                        {
                                                            item.remarks
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                        {filteredAttendance.length ===
                                            0 && (
                                            <EmptyTableRow
                                                colSpan={
                                                    6
                                                }
                                            />
                                        )}
                                    </tbody>
                                </table>
                            </ReportTableCard>
                        )}

                        {/* ======================================================== */}
                        {/* MATERIALS                                                 */}
                        {/* ======================================================== */}

                        {activeSection ===
                            "materials" && (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <ReportCard
                                        label="Stock Value"
                                        value={formatCurrency(
                                            statistics.stockValue
                                        )}
                                        icon={
                                            <Package className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Low Stock"
                                        value={
                                            statistics.lowStock
                                        }
                                        icon={
                                            <AlertTriangle className="h-5 w-5" />
                                        }
                                    />

                                    <ReportCard
                                        label="Transactions"
                                        value={
                                            filteredTransactions.length
                                        }
                                        icon={
                                            <TrendingUp className="h-5 w-5" />
                                        }
                                    />
                                </div>

                                <ReportTableCard
                                    title="Material Stock Report"
                                    description={`${filteredMaterials.length} materials found`}
                                    exportLabel="Export Materials"
                                    onExport={
                                        exportMaterials
                                    }
                                >
                                    <table className="w-full min-w-[1000px] text-left">
                                        <thead>
                                            <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-500">
                                                <th className="px-5 py-3">
                                                    Material
                                                </th>

                                                <th className="px-5 py-3">
                                                    Project
                                                </th>

                                                <th className="px-5 py-3">
                                                    Site
                                                </th>

                                                <th className="px-5 py-3">
                                                    Unit
                                                </th>

                                                <th className="px-5 py-3">
                                                    Quantity
                                                </th>

                                                <th className="px-5 py-3">
                                                    Min Stock
                                                </th>

                                                <th className="px-5 py-3">
                                                    Unit Price
                                                </th>

                                                <th className="px-5 py-3">
                                                    Value
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-zinc-800">
                                            {filteredMaterials.map(
                                                (
                                                    material
                                                ) => {
                                                    const isLowStock =
                                                        material.minimumStock !==
                                                            undefined &&
                                                        Number(
                                                            material.quantity
                                                        ) <=
                                                            Number(
                                                                material.minimumStock
                                                            );

                                                    return (
                                                        <tr
                                                            key={
                                                                material.materialId
                                                            }
                                                            className="hover:bg-zinc-800/30"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="font-medium text-white">
                                                                    {
                                                                        material.materialName
                                                                    }
                                                                </div>

                                                                {material.category && (
                                                                    <div className="mt-1 text-xs text-zinc-500">
                                                                        {
                                                                            material.category
                                                                        }
                                                                    </div>
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                                {
                                                                    material.projectName
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                                {
                                                                    material.siteName
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-400">
                                                                {
                                                                    material.unit
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={
                                                                        isLowStock
                                                                            ? "font-semibold text-red-400"
                                                                            : "text-zinc-300"
                                                                    }
                                                                >
                                                                    {formatNumber(
                                                                        Number(
                                                                            material.quantity ||
                                                                                0
                                                                        )
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-500">
                                                                {material.minimumStock ??
                                                                    "-"}
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-zinc-400">
                                                                {material.unitPrice !==
                                                                undefined
                                                                    ? formatCurrency(
                                                                          Number(
                                                                              material.unitPrice
                                                                          )
                                                                      )
                                                                    : "-"}
                                                            </td>

                                                            <td className="px-5 py-4 text-sm font-medium text-white">
                                                                {formatCurrency(
                                                                    Number(
                                                                        material.totalValue ||
                                                                            Number(
                                                                                material.quantity ||
                                                                                    0
                                                                            ) *
                                                                                Number(
                                                                                    material.unitPrice ||
                                                                                        0
                                                                                )
                                                                    )
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}

                                            {filteredMaterials.length ===
                                                0 && (
                                                <EmptyTableRow
                                                    colSpan={
                                                        8
                                                    }
                                                />
                                            )}
                                        </tbody>
                                    </table>
                                </ReportTableCard>

                                <ReportTableCard
                                    title="Material Transactions"
                                    description={`${filteredTransactions.length} transactions found`}
                                >
                                    <table className="w-full min-w-[900px] text-left">
                                        <thead>
                                            <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-500">
                                                <th className="px-5 py-3">
                                                    Date
                                                </th>

                                                <th className="px-5 py-3">
                                                    Material
                                                </th>

                                                <th className="px-5 py-3">
                                                    Type
                                                </th>

                                                <th className="px-5 py-3">
                                                    Site
                                                </th>

                                                <th className="px-5 py-3">
                                                    Destination
                                                </th>

                                                <th className="px-5 py-3">
                                                    Quantity
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-zinc-800">
                                            {filteredTransactions.map(
                                                (
                                                    transaction
                                                ) => (
                                                    <tr
                                                        key={
                                                            transaction.transactionId
                                                        }
                                                        className="hover:bg-zinc-800/30"
                                                    >
                                                        <td className="px-5 py-4 text-sm text-zinc-400">
                                                            {formatDate(
                                                                transaction.createdAt
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-white">
                                                                {
                                                                    transaction.materialName
                                                                }
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`rounded-full border px-2.5 py-1 text-xs ${
                                                                    transaction.transactionType ===
                                                                    "RECEIVE"
                                                                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                                                                        : transaction.transactionType ===
                                                                          "ISSUE"
                                                                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                                                                        : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                                                                }`}
                                                            >
                                                                {
                                                                    transaction.transactionType
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-zinc-300">
                                                            {
                                                                transaction.siteName
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-zinc-400">
                                                            {transaction.toSiteName ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-medium text-white">
                                                            {formatNumber(
                                                                Number(
                                                                    transaction.quantity ||
                                                                        0
                                                                )
                                                            )}{" "}
                                                            {
                                                                transaction.unit
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            )}

                                            {filteredTransactions.length ===
                                                0 && (
                                                <EmptyTableRow
                                                    colSpan={
                                                        6
                                                    }
                                                />
                                            )}
                                        </tbody>
                                    </table>
                                </ReportTableCard>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* DAILY UPDATES                                             */}
                        {/* ======================================================== */}

                        {activeSection ===
                            "updates" && (
                            <ReportTableCard
                                title="Daily Site Updates"
                                description={`${filteredUpdates.length} updates found`}
                            >
                                <table className="w-full min-w-[900px] text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-500">
                                            <th className="px-5 py-3">
                                                Date
                                            </th>

                                            <th className="px-5 py-3">
                                                Project
                                            </th>

                                            <th className="px-5 py-3">
                                                Site
                                            </th>

                                            <th className="px-5 py-3">
                                                Work Description
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredUpdates.map(
                                            (
                                                update
                                            ) => (
                                                <tr
                                                    key={
                                                        update.updateId
                                                    }
                                                    className="hover:bg-zinc-800/30"
                                                >
                                                    <td className="px-5 py-4 text-sm text-zinc-400">
                                                        {formatDate(
                                                            getDateValue(
                                                                update
                                                            )
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {
                                                            update.projectName
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {
                                                            update.siteName
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="max-w-2xl text-sm text-zinc-300">
                                                            {update.workDescription ||
                                                                update.description ||
                                                                "-"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                        {filteredUpdates.length ===
                                            0 && (
                                            <EmptyTableRow
                                                colSpan={
                                                    4
                                                }
                                            />
                                        )}
                                    </tbody>
                                </table>
                            </ReportTableCard>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function ReportCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {label}
                </span>

                <span className="text-zinc-500">
                    {icon}
                </span>
            </div>

            <div className="mt-2 text-2xl font-bold text-white">
                {value}
            </div>
        </div>
    );
}

function MiniStat({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-xs text-zinc-500">
                {label}
            </div>

            <div className="mt-1 text-xl font-semibold text-white">
                {value}
            </div>
        </div>
    );
}

function MovementCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-lg font-bold text-yellow-400">
                    {icon}
                </div>

                <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                        {label}
                    </div>

                    <div className="mt-1 text-2xl font-bold text-white">
                        {formatNumber(
                            value
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressRow({
    label,
    value,
    total,
}: {
    label: string;
    value: number;
    total: number;
}) {
    const percentage =
        total > 0
            ? Math.round(
                  (value / total) *
                      100
              )
            : 0;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                    {label}
                </span>

                <span className="text-zinc-300">
                    {value}{" "}
                    <span className="text-zinc-600">
                        / {total}
                    </span>
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

function ReportTableCard({
    title,
    description,
    exportLabel,
    onExport,
    children,
}: {
    title: string;
    description: string;
    exportLabel?: string;
    onExport?: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-semibold text-white">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                        {description}
                    </p>
                </div>

                {exportLabel &&
                    onExport && (
                        <button
                            type="button"
                            onClick={onExport}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-xs font-medium text-zinc-300 transition hover:border-yellow-500/40 hover:text-yellow-400"
                        >
                            <Download className="h-4 w-4" />
                            {exportLabel}
                        </button>
                    )}
            </div>

            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    );
}

function EmptyTableRow({
    colSpan,
}: {
    colSpan: number;
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-5 py-12 text-center"
            >
                <div className="flex flex-col items-center justify-center">
                    <BarChart3 className="mb-3 h-8 w-8 text-zinc-700" />

                    <div className="text-sm text-zinc-500">
                        No report data found
                    </div>
                </div>
            </td>
        </tr>
    );
}