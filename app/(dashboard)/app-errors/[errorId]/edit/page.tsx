"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
} from "lucide-react";

export default function EditAppErrorPage() {
    const { errorId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [form, setForm] = useState({
        module: "",
        errorTitle: "",
        occurredError: "",
        expectedError: "",
        status: "In Progress",

        reportedBy: "",
        reportedByName: "",
        reportedByEmail: "",

        createdAt: "",
        updatedAt: "",
    });

    useEffect(() => {
        loadUser();
        loadError();
    }, []);

    async function loadUser() {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.user) {
            setUser(data.user);
        }
    }

    async function loadError() {
        const res = await fetch(`/api/app-errors/${errorId}`);
        const data = await res.json();

        if (data.success) {
            setForm(data.error);
        } else {
            alert(data.message);
            router.push("/app-errors");
        }
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);

        const res = await fetch(
            `/api/app-errors/${errorId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            }
        );

        const data = await res.json();

        setLoading(false);

        if (data.success) {
            alert("Error updated successfully.");

            router.push(`/app-errors/${errorId}`);
            router.refresh();
        } else {
            alert(data.message);
        }
    }

    const isAdminOrManager =
        user &&
        ["ADMIN", "MANAGER"].includes(
            user.role?.toUpperCase()
        );

    return (
        <div className="mx-auto max-w-5xl">

            <div className="mb-6 flex items-center gap-3">

                <Link
                    href={`/app-errors/${errorId}`}
                    className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
                >
                    <ArrowLeft size={20} />
                </Link>

                <div>

                    <h1 className="text-3xl font-bold text-white">
                        Edit App Error
                    </h1>

                    <p className="text-slate-400">
                        Update application error details.
                    </p>

                </div>

            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
            >

                {/* Application */}

              {/* Application */}

<div>

    <label className="mb-2 block text-sm text-slate-300">
        Application
    </label>

    <select
        value={form.module}
        onChange={(e) =>
            setForm({
                ...form,
                module: e.target.value,
            })
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
    >
        <option value="DriWE">
            DriWE
        </option>

        <option value="DriWE Partners">
            DriWE Partners
        </option>

    </select>

</div>
                {/* Error Title */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Error Title
                    </label>

                    <input
                        value={form.errorTitle}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                errorTitle: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    />

                </div>

                {/* Occurred Error */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Occurred Error
                    </label>

                    <textarea
                        rows={5}
                        value={form.occurredError}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                occurredError: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    />

                </div>

                {/* Expected Error */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Expected Result
                    </label>

                    <textarea
                        rows={5}
                        value={form.expectedError}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                expectedError: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    />

                </div>

                {/* Status */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Status
                    </label>

                    <select
                        value={form.status}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                status: e.target.value,
                            })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    >
                        <option>In Progress</option>
                        <option>Pass</option>
                        <option>Fail</option>
                    </select>

                </div>

                {/* Reporter */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                        <label className="mb-2 block text-sm text-slate-300">
                            Reported By
                        </label>

                        <input
                            disabled
                            value={form.reportedByName}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm text-slate-300">
                            Email
                        </label>

                        <input
                            disabled
                            value={form.reportedByEmail}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
                        />

                    </div>

                </div>

                {/* Dates */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                        <label className="mb-2 block text-sm text-slate-300">
                            Created At
                        </label>

                        <input
                            disabled
                            value={
                                form.createdAt
                                    ? new Date(
                                        form.createdAt
                                    ).toLocaleString()
                                    : ""
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm text-slate-300">
                            Updated At
                        </label>

                        <input
                            disabled
                            value={
                                form.updatedAt
                                    ? new Date(
                                        form.updatedAt
                                    ).toLocaleString()
                                    : ""
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
                        />

                    </div>

                </div>

                {/* Save */}

                <div className="flex justify-end">

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
                    >
                        <Save size={18} />

                        {loading
                            ? "Updating..."
                            : "Update Error"}
                    </button>

                </div>

            </form>

        </div>
    );
}