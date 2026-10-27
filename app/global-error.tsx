"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
    useEffect(() => {
        console.error("Root application error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50 text-gray-900">
                <main className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="global-error-title">
                    <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700"><AlertTriangle className="h-5 w-5" /></div>
                            <div>
                                <h1 id="global-error-title" className="text-lg font-bold">The application hit an unexpected error</h1>
                                <p className="mt-2 text-sm leading-6 text-gray-700">{error.message || "Your request could not be completed. Please retry or return to the previous page."}</p>
                                {error.digest && <p className="mt-2 text-xs text-gray-500">Reference: {error.digest}</p>}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={unstable_retry} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"><RefreshCw className="h-4 w-4" /> Try again</button>
                        </div>
                    </section>
                </main>
            </body>
        </html>
    );
}
