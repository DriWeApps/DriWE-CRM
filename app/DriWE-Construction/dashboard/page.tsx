// "use client";

// import React from "react";
// import Link from "next/link";
// import {
//     Building2,
//     Users,
//     ClipboardList,
//     CalendarDays,
//     FileText,
//     ArrowRight,
//     HardHat,
//     BriefcaseBusiness,
// } from "lucide-react";

// export default function ConstructionDashboardPage() {
//     return (
//         <div className="min-h-screen bg-zinc-950 text-white">
//             {/* Header */}
//             <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
//                 <div className="flex items-center justify-between px-6 py-5">
//                     <div className="flex items-center gap-4">
//                         <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600">
//                             <HardHat className="h-6 w-6 text-black" />
//                         </div>

//                         <div>
//                             <h1 className="text-xl font-semibold">
//                                 DriWE Construction
//                             </h1>

//                             <p className="text-sm text-zinc-400">
//                                 Construction Management Portal
//                             </p>
//                         </div>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={async () => {
//                             await fetch("/api/auth/logout", {
//                                 method: "POST",
//                                 credentials: "include",
//                             });

//                             window.location.href = "/login";
//                         }}
//                         className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
//                     >
//                         Logout
//                     </button>
//                 </div>
//             </header>

//             {/* Main */}
//             <main className="px-6 py-10">
//                 <div className="mx-auto max-w-7xl">

//                     {/* Welcome */}
//                     <div className="mb-10">
//                         <h2 className="text-3xl font-bold">
//                             Construction Dashboard
//                         </h2>

//                         <p className="mt-2 text-zinc-400">
//                             Manage construction projects, workers, tasks and
//                             site activities.
//                         </p>
//                     </div>

//                     {/* Dashboard Cards */}
//                     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

//                         {/* Projects */}
//                         <Link
//                             href="/DriWE-Construction/projects"
//                             className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-orange-500/50 hover:bg-zinc-900/80"
//                         >
//                             <div className="mb-5 flex items-center justify-between">
//                                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
//                                     <Building2 className="h-6 w-6 text-orange-400" />
//                                 </div>

//                                 <ArrowRight className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-orange-400" />
//                             </div>

//                             <h3 className="text-lg font-semibold">
//                                 Projects
//                             </h3>

//                             <p className="mt-2 text-sm text-zinc-400">
//                                 Manage construction projects and project details.
//                             </p>
//                         </Link>

//                         {/* Workers */}
//                         <Link
//                             href="/DriWE-Construction/workers"
//                             className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500/50 hover:bg-zinc-900/80"
//                         >
//                             <div className="mb-5 flex items-center justify-between">
//                                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
//                                     <Users className="h-6 w-6 text-blue-400" />
//                                 </div>

//                                 <ArrowRight className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-blue-400" />
//                             </div>

//                             <h3 className="text-lg font-semibold">
//                                 Workers
//                             </h3>

//                             <p className="mt-2 text-sm text-zinc-400">
//                                 Manage workers and construction team members.
//                             </p>
//                         </Link>

//                         {/* Tasks */}
//                         <Link
//                             href="/DriWE-Construction/tasks"
//                             className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-green-500/50 hover:bg-zinc-900/80"
//                         >
//                             <div className="mb-5 flex items-center justify-between">
//                                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
//                                     <ClipboardList className="h-6 w-6 text-green-400" />
//                                 </div>

//                                 <ArrowRight className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-green-400" />
//                             </div>

//                             <h3 className="text-lg font-semibold">
//                                 Tasks
//                             </h3>

//                             <p className="mt-2 text-sm text-zinc-400">
//                                 Track construction tasks and assignments.
//                             </p>
//                         </Link>

//                         {/* Meetings */}
//                         <Link
//                             href="/DriWE-Construction/meetings"
//                             className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-purple-500/50 hover:bg-zinc-900/80"
//                         >
//                             <div className="mb-5 flex items-center justify-between">
//                                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
//                                     <CalendarDays className="h-6 w-6 text-purple-400" />
//                                 </div>

//                                 <ArrowRight className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-purple-400" />
//                             </div>

//                             <h3 className="text-lg font-semibold">
//                                 Meetings
//                             </h3>

//                             <p className="mt-2 text-sm text-zinc-400">
//                                 Schedule and manage construction meetings.
//                             </p>
//                         </Link>
//                     </div>

//                     {/* Quick Access */}
//                     <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
//                         <div className="mb-6 flex items-center gap-3">
//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
//                                 <BriefcaseBusiness className="h-5 w-5 text-orange-400" />
//                             </div>

//                             <div>
//                                 <h3 className="text-xl font-semibold">
//                                     Quick Access
//                                 </h3>

//                                 <p className="text-sm text-zinc-400">
//                                     Frequently used construction management
//                                     sections
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="grid gap-4 md:grid-cols-3">

//                             {/* Construction Projects */}
//                             <Link
//                                 href="/DriWE-Construction/projects"
//                                 className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-orange-500/50"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <Building2 className="h-5 w-5 text-orange-400" />

//                                     <span>
//                                         Construction Projects
//                                     </span>
//                                 </div>

//                                 <ArrowRight className="h-4 w-4 text-zinc-500" />
//                             </Link>

//                             {/* Construction Tasks */}
//                             <Link
//                                 href="/DriWE-Construction/tasks"
//                                 className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-green-500/50"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <ClipboardList className="h-5 w-5 text-green-400" />

//                                     <span>
//                                         Construction Tasks
//                                     </span>
//                                 </div>

//                                 <ArrowRight className="h-4 w-4 text-zinc-500" />
//                             </Link>

//                             {/* Reports */}
//                             <Link
//                                 href="/DriWE-Construction/reports"
//                                 className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-blue-500/50"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <FileText className="h-5 w-5 text-blue-400" />

//                                     <span>
//                                         Reports
//                                     </span>
//                                 </div>

//                                 <ArrowRight className="h-4 w-4 text-zinc-500" />
//                             </Link>

//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }


"use client";

import React from "react";
import {
    Building2,
    Home,
    Factory,
    Hammer,
    BriefcaseBusiness,
    ArrowRight,
    HardHat,
    IndianRupee,
} from "lucide-react";

const constructionServices = [
    {
        id: 1,
        title: "Residential Construction",
        description:
            "Complete construction solutions for residential buildings, villas and housing projects.",
        price: "₹25,00,000",
        priceLabel: "Starting From",
        icon: Home,
        iconStyle: "bg-orange-500/10 text-orange-400",
        borderStyle: "hover:border-orange-500/50",
    },
    {
        id: 2,
        title: "Commercial Construction",
        description:
            "Construction management for offices, commercial buildings, shops and business spaces.",
        price: "₹45,00,000",
        priceLabel: "Starting From",
        icon: Building2,
        iconStyle: "bg-blue-500/10 text-blue-400",
        borderStyle: "hover:border-blue-500/50",
    },
    {
        id: 3,
        title: "Renovation & Remodeling",
        description:
            "Upgrade existing properties with renovation, remodeling and structural improvement services.",
        price: "₹8,50,000",
        priceLabel: "Starting From",
        icon: Hammer,
        iconStyle: "bg-green-500/10 text-green-400",
        borderStyle: "hover:border-green-500/50",
    },
    {
        id: 4,
        title: "Industrial Construction",
        description:
            "Construction solutions for factories, warehouses, industrial facilities and infrastructure.",
        price: "₹75,00,000",
        priceLabel: "Starting From",
        icon: Factory,
        iconStyle: "bg-purple-500/10 text-purple-400",
        borderStyle: "hover:border-purple-500/50",
    },
    {
        id: 5,
        title: "Turnkey Construction",
        description:
            "End-to-end construction management from planning and workforce to project completion.",
        price: "₹35,00,000",
        priceLabel: "Starting From",
        icon: BriefcaseBusiness,
        iconStyle: "bg-yellow-500/10 text-yellow-400",
        borderStyle: "hover:border-yellow-500/50",
    },
];

export default function ConstructionDashboardPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* Background */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    {/* Logo / Brand */}
                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/20">
                            <HardHat className="h-6 w-6 text-black" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">
                                DriWE Construction
                            </h1>

                            <p className="text-sm text-zinc-500">
                                Construction Management Platform
                            </p>
                        </div>

                    </div>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={async () => {
                            await fetch("/api/auth/logout", {
                                method: "POST",
                                credentials: "include",
                            });

                            window.location.href = "/login";
                        }}
                        className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
                    >
                        Logout
                    </button>

                </div>
            </header>

            {/* Main */}
            <main className="relative z-10 px-6 py-12">

                <div className="mx-auto max-w-7xl">

                    {/* Page Heading */}
                    <div className="mx-auto mb-12 max-w-3xl text-center">

                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
                            <Building2 className="h-7 w-7 text-orange-400" />
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Construction Solutions
                        </h2>

                        <p className="mt-4 text-base leading-7 text-zinc-400">
                            Choose the construction solution that fits your
                            project. Manage your project, workforce and
                            construction activities from one platform.
                        </p>

                    </div>

                    {/* Cards */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {constructionServices.map((service) => {
                            const Icon = service.icon;

                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    className={`group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/80 ${service.borderStyle}`}
                                >

                                    {/* Card Glow */}
                                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl transition group-hover:bg-orange-500/10" />

                                    {/* Card Content */}
                                    <div className="relative">

                                        {/* Icon + Arrow */}
                                        <div className="mb-7 flex items-center justify-between">

                                            <div
                                                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.iconStyle}`}
                                            >
                                                <Icon className="h-7 w-7" />
                                            </div>

                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-600 transition group-hover:border-zinc-700 group-hover:text-white">
                                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                            </div>

                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-white">
                                            {service.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-500">
                                            {service.description}
                                        </p>

                                        {/* Divider */}
                                        <div className="my-6 h-px bg-zinc-800" />

                                        {/* Price */}
                                        <div>

                                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                                                {service.priceLabel}
                                            </p>

                                            <div className="mt-2 flex items-center gap-2">

                                                <IndianRupee className="h-5 w-5 text-orange-400" />

                                                <span className="text-2xl font-bold text-white">
                                                    {service.price}
                                                </span>

                                            </div>

                                        </div>

                                        {/* Bottom Action */}
                                        <div className="mt-6 flex items-center justify-between">

                                            <span className="text-sm font-medium text-zinc-400 transition group-hover:text-orange-400">
                                                Explore Solution
                                            </span>

                                            <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-orange-400" />

                                        </div>

                                    </div>

                                </button>
                            );
                        })}

                    </div>

                    {/* Small Note */}
                    <div className="mx-auto mt-10 max-w-2xl text-center">

                        <p className="text-xs leading-5 text-zinc-600">
                            * Prices shown above are sample prices for
                            demonstration purposes and can be changed based
                            on project requirements.
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}