"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Bug,
} from "lucide-react";

export default function AddAppErrorPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        module: "DriWE",
        errorTitle: "",
        occurredError: "",
        expectedError: "",
        status: "In Progress",
    });

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);

        const res = await fetch("/api/app-errors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        setLoading(false);

        if (data.success) {
            alert("Error reported successfully.");

            router.push("/app-errors");
            router.refresh();
        } else {
            alert(data.message);
        }
    }

    return (
        <div className="mx-auto max-w-5xl">

            <div className="mb-6 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <Link
                        href="/app-errors"
                        className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <h1 className="text-3xl font-bold text-white">
                            Report App Error
                        </h1>

                        <p className="text-slate-400">
                            Report bugs found while testing the applications.
                        </p>

                    </div>

                </div>

            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
            >

                <div className="flex items-center gap-3">

                    <Bug className="text-cyan-400" size={28} />

                    <h2 className="text-xl font-semibold text-white">
                        Error Details
                    </h2>

                </div>

                {/* Module */}

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
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
                    >
                        <option>DriWE</option>
                        <option>DriWE Partners</option>
                    </select>

                </div>

                {/* Error Title */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Error Title
                    </label>

                    <input
                        required
                        value={form.errorTitle}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                errorTitle: e.target.value,
                            })
                        }
                        placeholder="Example: Login button not working"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
                    />

                </div>

                {/* Occurred Error */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Occurred Error
                    </label>

                    <textarea
                        required
                        rows={5}
                        value={form.occurredError}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                occurredError: e.target.value,
                            })
                        }
                        placeholder="Describe what actually happened..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
                    />

                </div>

                {/* Expected Error */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Expected Result
                    </label>

                    <textarea
                        required
                        rows={5}
                        value={form.expectedError}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                expectedError: e.target.value,
                            })
                        }
                        placeholder="Describe what should happen..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
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
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
                    >

                        <option>Solved</option>
                        <option>Unsolved</option>
                        <option>In Progress</option>
                        <option>Reoccurred</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                    </select>

                </div>

                {/* Date */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Date & Time
                    </label>

                    <input
                        disabled
                        value={new Date().toLocaleString()}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                        Automatically recorded when submitted.
                    </p>

                </div>

                <div className="flex justify-end">

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
                    >
                        <Save size={18} />

                        {loading
                            ? "Submitting..."
                            : "Submit Error"}

                    </button>

                </div>

            </form>

        </div>
    );
}