"use client";

import Link from "next/link";

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
    updatedAt: string;
}

interface Props {
    error: AppError;
}

export default function AppErrorDetails({
    error,
}: Props) {
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

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <div className="mb-8 flex items-center justify-between">

                <div>

                    <h2 className="text-2xl font-bold text-white">
                        App Error Details
                    </h2>

                    <p className="mt-1 text-slate-400">
                        Complete information about the reported issue.
                    </p>

                </div>

                <Link
                    href={`/app-errors/${error.errorId}/edit`}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
                >
                    Edit
                </Link>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

                <Field
                    label="Application"
                    value={error.module}
                />

                <div>
                    <p className="text-sm text-slate-400">
                        Status
                    </p>

                    <span
                        className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusColor(
                            error.status
                        )}`}
                    >
                        {error.status}
                    </span>
                </div>

                <Field
                    label="Reported By"
                    value={error.reportedByName}
                />

                <Field
                    label="Reporter Email"
                    value={error.reportedByEmail}
                />

                <Field
                    label="Reported On"
                    value={new Date(
                        error.createdAt
                    ).toLocaleString()}
                />

                <Field
                    label="Last Updated"
                    value={new Date(
                        error.updatedAt
                    ).toLocaleString()}
                />

            </div>

            <div className="mt-8">

                <p className="mb-2 text-sm text-slate-400">
                    Error Title
                </p>

                <div className="rounded-xl bg-slate-800 p-4 text-white">
                    {error.errorTitle}
                </div>

            </div>

            <div className="mt-6">

                <p className="mb-2 text-sm text-slate-400">
                    Occurred Error
                </p>

                <div className="whitespace-pre-wrap rounded-xl bg-slate-800 p-4 text-white">
                    {error.occurredError}
                </div>

            </div>

            <div className="mt-6">

                <p className="mb-2 text-sm text-slate-400">
                    Expected Result
                </p>

                <div className="whitespace-pre-wrap rounded-xl bg-slate-800 p-4 text-white">
                    {error.expectedError}
                </div>

            </div>

        </div>
    );
}

function Field({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>

            <p className="text-sm text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-white">
                {value || "-"}
            </p>

        </div>
    );
}