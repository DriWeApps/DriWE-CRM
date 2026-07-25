"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppError {
    errorId?: string;
    module: string;
    errorTitle: string;
    occurredError: string;
    expectedError: string;
    status: string;
    createdAt?: string;
}

interface User {
    userId?: string;
    employeeId?: string;
    email?: string;
    role?: string;
}

interface Props {
    initialData?: AppError;
    isEdit?: boolean;
}

export default function AppErrorForm({
    initialData,
    isEdit = false,
}: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);

    const [user, setUser] = useState<User | null>(null);

    const [form, setForm] = useState<AppError>({
        module: initialData?.module || "DriWE",
        errorTitle: initialData?.errorTitle || "",
        occurredError: initialData?.occurredError || "",
        expectedError: initialData?.expectedError || "",
        status: initialData?.status || "In Progress",
    });

    /**
     * Load logged-in user
     */
    useEffect(() => {
        async function loadUser() {
            try {
                const res = await fetch("/api/auth/me");

                const data = await res.json();

                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error(
                    "Failed to load user:",
                    error,
                );
            } finally {
                setLoadingUser(false);
            }
        }

        loadUser();
    }, []);

    /**
     * Load existing error into form
     */
    //    useEffect(() => {
    //     if (!initialData) return;

    //     setForm({
    //         errorId: initialData.errorId,
    //         module: initialData.module || "DriWE",
    //         errorTitle: initialData.errorTitle || "",
    //         occurredError: initialData.occurredError || "",
    //         expectedError: initialData.expectedError || "",
    //         status: initialData.status || "In Progress",
    //     });
    // }, [
    //     initialData?.errorId,
    // ]);

  useEffect(() => {
    if (!initialData) return;

    setForm((prev) => ({
        ...prev,
        module: initialData.module || "DriWE",
        errorTitle: initialData.errorTitle || "",
        occurredError: initialData.occurredError || "",
        expectedError: initialData.expectedError || "",
        status: initialData.status || "In Progress",
    }));

}, [initialData]);

    const role = String(
        user?.role || "",
    ).toUpperCase();

    const isAdminOrManager =
        role === "ADMIN" ||
        role === "MANAGER";

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>,
    ) {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            const url = isEdit
                ? `/api/app-errors/${initialData?.errorId}`
                : "/api/app-errors";

            const method = isEdit
                ? "PUT"
                : "POST";

           const requestData: any = {
    module: form.module,
    errorTitle: form.errorTitle,
    occurredError: form.occurredError,
    expectedError: form.expectedError,
};


if (isAdminOrManager) {
    requestData.status = form.status;
}

            console.log(
                "Submitting App Error:",
                requestData,
            );

            console.log("FINAL FORM DATA:", form);
console.log("SENDING:", requestData);

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    requestData,
                ),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(
                    data.message ||
                    "Something went wrong.",
                );
                return;
            }

            alert(
                isEdit
                    ? "Error updated successfully."
                    : "Error reported successfully.",
            );

            router.push("/app-errors");
            router.refresh();
        } catch (error) {
            console.error(
                "Submit App Error:",
                error,
            );

            alert(
                "Something went wrong while saving the error.",
            );
        } finally {
            setLoading(false);
        }
    }

    if (loadingUser) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                Loading...
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
            {/* Application */}

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                    Application
                </label>

                <select
                    value={form.module}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            module: e.target.value,
                        }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                >
                    <option value="DriWE">DriWE</option>
                    <option value="DriWE Partners">DriWE Partners</option>
                </select>
            </div>

            {/* Error Title */}

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                    Error Title
                </label>

                {/* <input
                    type="text"
                    required
                    value={form.errorTitle}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            module: e.target.value,
                        }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    placeholder="Enter short title"
                /> */}

                <input
    type="text"
    required
    value={form.errorTitle}
    onChange={(e) =>
        setForm((prev) => ({
            ...prev,
            errorTitle: e.target.value,
        }))
    }
    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
    placeholder="Enter short title"
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
                    value={
                        form.occurredError
                    }
                    onChange={(e) =>
                        setForm({
                            ...form,
                            occurredError:
                                e.target.value,
                        })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    placeholder="Describe what happened..."
                />
            </div>

            {/* Expected Result */}

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                    Expected Result
                </label>

                <textarea
                    required
                    rows={5}
                    value={
                        form.expectedError
                    }
                    onChange={(e) =>
                        setForm({
                            ...form,
                            expectedError:
                                e.target.value,
                        })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
                    placeholder="Describe expected behaviour..."
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
                    <option value="Pass">
                        Pass
                    </option>

                    <option value="Fail">
                        Fail
                    </option>

                    <option value="In Progress">
                        In Progress
                    </option>
                </select>


            </div>

            {/* Date & Time */}

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                    Date & Time
                </label>

                <input
                    disabled
                    value={
                        initialData?.createdAt
                            ? new Date(
                                initialData.createdAt,
                            ).toLocaleString()
                            : new Date().toLocaleString()
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400"
                />
            </div>

            {/* Submit */}

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Saving..."
                    : isEdit
                        ? "Update Error"
                        : "Report Error"}
            </button>
        </form>
    );
}