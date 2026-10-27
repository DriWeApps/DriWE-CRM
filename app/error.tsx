"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

type AppErrorProps = {
    error: Error & { digest?: string };
    unstable_retry: () => void;
};

export default function AppError({ error, unstable_retry }: AppErrorProps) {
    const router = useRouter();

    useEffect(() => {
        console.error("Application page error:", error);
    }, [error]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="app-error-title">
            <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700"><AlertTriangle className="h-5 w-5" /></div>
                    <div>
                        <h1 id="app-error-title" className="text-lg font-bold">Something went wrong</h1>
                        <p className="mt-2 text-sm leading-6 text-gray-700">{error.message || "The page could not complete your request. Please try again."}</p>
                        {error.digest && <p className="mt-2 text-xs text-gray-500">Reference: {error.digest}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Go back</button>
                    <button type="button" onClick={unstable_retry} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"><RefreshCw className="h-4 w-4" /> Try again</button>
                </div>
            </section>
        </div>
    );
}
