"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ConstructionErrorProps = {
    error: Error & { digest?: string };
    unstable_retry: () => void;
};

export default function ConstructionError({
    error,
    unstable_retry,
}: ConstructionErrorProps) {
    const router = useRouter();

    useEffect(() => {
        console.error("Construction page error:", error);
    }, [error]);

    const message = error.message?.trim()
        ? error.message
        : "The page encountered an unexpected problem. Your information has not been changed.";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="construction-error-title">
            <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-black shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 id="construction-error-title" className="text-lg font-bold">We couldn&apos;t finish that action</h1>
                        <p className="mt-2 text-sm leading-6 text-gray-700">{message}</p>
                        {error.digest && <p className="mt-2 text-xs text-gray-500">Reference: {error.digest}</p>}
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50">Go back</button>
                    <button type="button" onClick={unstable_retry} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
                        <RefreshCw className="h-4 w-4" /> Try again
                    </button>
                </div>
            </section>
        </div>
    );
}
