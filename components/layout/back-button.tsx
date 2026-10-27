"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
    fallbackHref: string;
    children?: React.ReactNode;
    className?: string;
};

export function BackButton({
    fallbackHref,
    children = "Back",
    className = "",
}: BackButtonProps) {
    const router = useRouter();

    function handleBack() {
        // Go back exactly one entry when navigation began inside this app.
        // Use a known in-app destination when the page was opened directly.
        if (window.history.state?.idx > 0) {
            router.back();
        } else {
            router.replace(fallbackHref);
        }
    }

    return (
        <button type="button" onClick={handleBack} className={className}>
            <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
            {children}
        </button>
    );
}
