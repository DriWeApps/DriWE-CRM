import { AlertTriangle, X } from "lucide-react";

type ErrorPopupProps = {
    message: string;
    onClose: () => void;
};

export function ErrorPopup({ message, onClose }: ErrorPopupProps) {
    if (!message.trim()) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="presentation">
            <section
                aria-labelledby="error-popup-title"
                aria-describedby="error-popup-message"
                aria-modal="true"
                role="alertdialog"
                className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-gray-900 shadow-2xl"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 id="error-popup-title" className="font-semibold">Unable to complete the request</h2>
                        <p id="error-popup-message" className="mt-2 break-words text-sm leading-6 text-gray-700">
                            {message}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close error message"
                        className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-black"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                        Got it
                    </button>
                </div>
            </section>
        </div>
    );
}
