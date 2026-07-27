"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Pencil,
} from "lucide-react";

export default function AppErrorDetailsPage() {
    const { errorId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        loadError();
    }, []);

    async function loadError() {
        try {
            const res = await fetch(`/api/app-errors/${errorId}`);
            const data = await res.json();

            if (data.success) {
                setError(data.error);
            } else {
                alert(data.message);
                router.push("/app-errors");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function statusColor(status: string) {
        switch (status) {
            case "Pass":
                return "bg-green-600 text-white";

            case "Fail":
                return "bg-red-600 text-white";

            default:
                return "bg-yellow-500 text-black";
        }
    }

    if (loading) {
        return (
            <div className="p-10 text-white">
                Loading...
            </div>
        );
    }

    if (!error) {
        return (
            <div className="p-10 text-white">
                Error not found.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <Link
                        href="/app-errors"
                        className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <h1 className="text-3xl font-bold text-white">
                            App Error Details
                        </h1>

                        <p className="text-slate-400">
                            View complete error information.
                        </p>

                    </div>

                </div>

                <button
                    onClick={() =>
                        router.push(`/app-errors/${errorId}/edit`)
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                    <Pencil size={18} />
                    Edit
                </button>

            </div>

            <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <Item
                    label="Application"
                    value={error.module}
                />

                <Item
                    label="Error Title"
                    value={error.errorTitle}
                />

                <Item
                    label="Occurred Error"
                    value={error.occurredError}
                    multiline
                />

                <Item
                    label="Expected Result"
                    value={error.expectedError}
                    multiline
                />

                <div>
                    <p className="text-sm text-slate-400">
                        Status
                    </p>

                    <span
                        className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold ${statusColor(
                            error.status
                        )}`}
                    >
                        {error.status}
                    </span>
                </div>

                <Item
                    label="Reported By"
                    value={error.reportedByName}
                />

                <Item
                    label="Email"
                    value={error.reportedByEmail}
                />

                <Item
                    label="Reported On"
                    value={new Date(
                        error.createdAt
                    ).toLocaleString()}
                />

                <Item
                    label="Last Updated"
                    value={new Date(
                        error.updatedAt
                    ).toLocaleString()}
                />

            </div>

        </div>
    );
}

function Item({
    label,
    value,
    multiline = false,
}: {
    label: string;
    value: any;
    multiline?: boolean;
}) {
    return (
        <div>

            <p className="text-sm text-slate-400">
                {label}
            </p>

            {multiline ? (
                <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-800 p-4 text-white">
                    {value || "-"}
                </div>
            ) : (
                <p className="mt-1 text-lg text-white">
                    {value || "-"}
                </p>
            )}

        </div>
    );
}