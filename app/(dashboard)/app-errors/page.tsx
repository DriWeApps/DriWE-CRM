"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Plus,
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";


interface AppError {
    errorId: string;
    module: string;
    errorTitle: string;
    occurredError: string;
    expectedError: string;
    status: string;
    reportedByName: string;
    reportedByEmail: string;
    createdAt: string;
}

export default function AppErrorsPage() {
    const router = useRouter();
    const [errors, setErrors] = useState<AppError[]>([]);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
        loadErrors();
    }, []);

    async function loadUser() {
        try {
            const res = await fetch("/api/auth/me", {
                credentials: "include",
            });

            const data = await res.json();

            if (!data.authenticated || !data.user) {
                router.replace("/login");
                return;
            }

            // Admin can access everything
            if (data.user.role?.toUpperCase() !== "ADMIN") {
                const pageAccess = data.user.pageAccess || [];

                if (!pageAccess.includes("app-errors")) {
                    alert("You don't have permission to access App Errors.");
                    router.replace("/dashboard");
                    return;
                }
            }

            setUser(data.user);
        } catch (error) {
            console.error(error);
            router.replace("/dashboard");
        }
    }

    async function loadErrors() {
        try {
            const res = await fetch("/api/app-errors");
            const data = await res.json();

            if (data.success) {
                setErrors(data.errors);
            }
        } finally {
            setLoading(false);
        }
    }

    async function deleteError(id: string) {
        if (!confirm("Delete this error?")) return;

        const res = await fetch(`/api/app-errors/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (data.success) {
            loadErrors();
        } else {
            alert(data.message);
        }
    }


    function downloadExcel() {
        const sheetData = errors.map((item, index) => ({
            "Sr. No": index + 1,
            Module: item.module,
            "Error Title": item.errorTitle,
            "Occurred Error": item.occurredError,
            "Expected Error": item.expectedError,
            Status: item.status,
            "Reported By": item.reportedByName,
            Email: item.reportedByEmail,
            Date: new Date(item.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "App Errors"
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const file = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(
            file,
            `AppErrors_${new Date().toISOString().split("T")[0]}.xlsx`
        );
    }


    function statusColor(status: string) {
        switch (status) {
            case "Pass":
                return "bg-green-600";

            case "Fail":
                return "bg-red-600";

            default:
                return "bg-yellow-500 text-black";
        }
    }

    const canDelete =
        user &&
        ["ADMIN", "MANAGER"].includes(
            user.role?.toUpperCase()
        );

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-white">
                        App Errors
                    </h1>

                    <p className="text-slate-400">
                        Report and track application issues.
                    </p>

                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={downloadExcel}
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white hover:bg-green-700"
                    >
                        <Download size={18} />
                        Download Sheet
                    </button>

                    {user &&
                        (user.role?.toUpperCase() === "ADMIN" ||
                            user.pageAccess?.includes("app-errors")) && (
                            <Link
                                href="/app-errors/add"
                                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-white hover:bg-cyan-700"
                            >
                                <Plus size={18} />
                                Report Error
                            </Link>
                        )}

                </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                <table className="w-full">

                    <thead className="bg-slate-950">

                        <tr className="text-left text-slate-300">

                            <th className="p-4">Module</th>
                            <th>Error</th>
                            <th>Status</th>
                            <th>Reported By</th>
                            <th>Date</th>
                            <th className="text-center">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan={6}
                                    className="p-8 text-center text-slate-400"
                                >
                                    Loading...
                                </td>

                            </tr>

                        ) : errors.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={6}
                                    className="p-8 text-center text-slate-400"
                                >
                                    No errors reported.
                                </td>

                            </tr>

                        ) : (

                            errors.map((item) => (

                                <tr
                                    key={item.errorId}
                                    className="border-t border-slate-800 hover:bg-slate-800/50"
                                >

                                    <td className="p-4 text-white">
                                        {item.module}
                                    </td>

                                    <td className="font-medium text-white">
                                        {item.errorTitle}
                                    </td>

                                    <td>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>

                                    </td>

                                    <td className="text-slate-300">
                                        {item.reportedByName}
                                    </td>

                                    <td className="text-slate-400">
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleDateString()}
                                    </td>

                                    <td>

                                        <div className="flex justify-center gap-2">

                                            <Link
                                                href={`/app-errors/${item.errorId}`}
                                                className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            {user &&
                                                (user.role?.toUpperCase() === "ADMIN" ||
                                                    user.pageAccess?.includes("app-errors")) && (
                                                    <Link
                                                        href={`/app-errors/${item.errorId}/edit`}
                                                        className="rounded-lg bg-amber-500 p-2 text-black hover:bg-amber-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                )}

                                            {canDelete && (
                                                <button
                                                    onClick={() =>
                                                        deleteError(item.errorId)
                                                    }
                                                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}