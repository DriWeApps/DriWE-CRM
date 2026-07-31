"use client";

import {
    CalendarDays,
    Filter,
    Mail,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

interface Driver {
    customerId: string;

    name: string;
    email: string;
    contactNo: string;

    type: "Cab" | "Courier"; // ADD THIS

    status: "Accept" | "Reject" | "Hold";
    reason: string;

    date: string;

    createdBy: string;
    createdByName: string;
    createdByEmail: string;

    createdAt: string;
    updatedAt: string;
}

export default function CustomerManagementDriverPage() {
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "Accept" | "Reject" | "Hold"
    >("ALL");


    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(
        null
    );



    /* =====================================================
       FILTERS
    ===================================================== */

    const [date, setDate] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [email, setEmail] = useState("");

    const [showFilters, setShowFilters] = useState(false);

    /* =====================================================
       LOAD DRIVERS
    ===================================================== */

    async function fetchDrivers() {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (date) {
                params.set("date", date);
            }

            if (fromDate) {
                params.set("fromDate", fromDate);
            }

            if (toDate) {
                params.set("toDate", toDate);
            }

            if (contactNo.trim()) {
                params.set("contactNo", contactNo.trim());
            }

            if (email.trim()) {
                params.set("email", email.trim());
            }

            const queryString = params.toString();

            const url = queryString
                ? `/api/customer-management-driver?${queryString}`
                : "/api/customer-management-driver";

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch drivers"
                );
            }

            setDrivers(data.drivers || []);
        } catch (error) {
            console.error(
                "Fetch Drivers Error:",
                error
            );

            setDrivers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDrivers();
    }, []);

    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    function handleApplyFilters() {
        fetchDrivers();
    }

    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    function handleClearFilters() {
        setDate("");
        setFromDate("");
        setToDate("");
        setContactNo("");
        setEmail("");

        setTimeout(() => {
            fetchDrivers();
        }, 0);
    }

    /* =====================================================
       DELETE
    ===================================================== */

    async function handleDelete(
        customerId: string,
        name: string
    ) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(customerId);

            const res = await fetch(
                `/api/customer-management-driver/${customerId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to delete driver"
                );
            }

            setDrivers((current) =>
                current.filter(
                    (driver) =>
                        driver.customerId !== customerId
                )
            );

            alert("Driver deleted successfully.");
        } catch (error) {
            console.error(
                "Delete Driver Error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete driver."
            );
        } finally {
            setDeletingId(null);
        }
    }

    function downloadExcel() {
        const sheetData = filteredDrivers.map((driver, index) => ({
            "Sr. No": index + 1,
            Name: driver.name,
            Email: driver.email,
            "Contact No": driver.contactNo,
            Type: driver.type,
            Status: driver.status,
            Reason: driver.reason,
            Date: driver.date,
            "Added By": driver.createdByName,
            "Added By Email": driver.createdByEmail,
            "Created At": new Date(driver.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            statusFilter === "ALL"
                ? "All Drivers"
                : `${statusFilter} Drivers`
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const file = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(file);

        const a = document.createElement("a");
        a.href = url;
        const fileName =
            statusFilter === "ALL"
                ? "All_Drivers"
                : `${statusFilter}_Drivers`;

        a.download = `${fileName}_${new Date()
            .toISOString()
            .split("T")[0]}.xlsx`;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    /* =====================================================
       STATUS BADGE
    ===================================================== */

    function getStatusClass(status: Driver["status"]) {
        if (status === "Accept") {
            return "bg-green-500/10 text-green-400 border-green-500/20";
        }

        if (status === "Reject") {
            return "bg-red-500/10 text-red-400 border-red-500/20";
        }

        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    /* =====================================================
       STATS
    ===================================================== */


    const filteredDrivers =
        statusFilter === "ALL"
            ? drivers
            : drivers.filter(
                (driver) => driver.status === statusFilter
            );

    const totalDrivers = drivers.length;

    const acceptedDrivers = drivers.filter(
        (driver) => driver.status === "Accept"
    ).length;

    const rejectedDrivers = drivers.filter(
        (driver) => driver.status === "Reject"
    ).length;

    const holdDrivers = drivers.filter(
        (driver) => driver.status === "Hold"
    ).length;

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
          HEADER
      ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        Customer Management (Driver)
                    </h1>

                    <p className="mt-1 text-sm text-slate-400 sm:text-base">
                        Manage driver/customer information and status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">

                    <button
                        type="button"
                        onClick={() => setShowFilters((value) => !value)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800"
                    >
                        <Filter size={18} />

                        {showFilters
                            ? "Hide Filters"
                            : "Filters"}
                    </button>

                    <button
                        type="button"
                        onClick={fetchDrivers}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={18}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={downloadExcel}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                        <Download size={18} />
                        Download Sheet
                    </button>


                    <Link
                        href="/customer-management-driver/add"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        <Plus size={18} />
                        Add Driver
                    </Link>

                </div>
            </div>

            {/* =================================================
          STATS
      ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Total */}

                <div
                    onClick={() => setStatusFilter("ALL")}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${statusFilter === "ALL"
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-800 bg-slate-900 hover:border-cyan-500"
                        }`}
                >
                    {/* <div className="flex items-center justify-between"> */}

                    <div
                        onClick={() => setStatusFilter("ALL")}
                        className={`cursor-pointer rounded-2xl border p-5 transition ${statusFilter === "ALL"
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-cyan-500"
                            }`}
                    >

                        <div>
                            <p className="text-sm text-slate-400">
                                Total Drivers
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                {totalDrivers}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                            <UserRound
                                size={22}
                                className="text-cyan-400"
                            />
                        </div>

                    </div>
                </div>

                {/* Accepted */}

                <div
                    onClick={() => setStatusFilter("Accept")}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${statusFilter === "Accept"
                        ? "border-green-500 bg-green-500/10"
                        : "border-slate-800 bg-slate-900 hover:border-green-500"
                        }`}
                >
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-slate-400">
                                Accepted
                            </p>

                            <p className="mt-2 text-3xl font-bold text-green-400">
                                {acceptedDrivers}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
                            <span className="text-xl text-green-400">
                                ✓
                            </span>
                        </div>

                    </div>
                </div>

                {/* Rejected */}

                <div
                    onClick={() => setStatusFilter("Reject")}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${statusFilter === "Reject"
                        ? "border-red-500 bg-red-500/10"
                        : "border-slate-800 bg-slate-900 hover:border-red-500"
                        }`}
                >
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-slate-400">
                                Rejected
                            </p>

                            <p className="mt-2 text-3xl font-bold text-red-400">
                                {rejectedDrivers}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                            <X
                                size={22}
                                className="text-red-400"
                            />
                        </div>

                    </div>
                </div>

                {/* Hold */}

                <div
                    onClick={() => setStatusFilter("Hold")}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${statusFilter === "Hold"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-slate-800 bg-slate-900 hover:border-yellow-500"
                        }`}
                >
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-slate-400">
                                On Hold
                            </p>

                            <p className="mt-2 text-3xl font-bold text-yellow-400">
                                {holdDrivers}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10">
                            <span className="text-xl text-yellow-400">
                                !
                            </span>
                        </div>

                    </div>
                </div>

            </div>

            {/* =================================================
          FILTER PANEL
      ================================================= */}

            {showFilters && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

                    <div className="mb-5 flex items-center justify-between">

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Filter Drivers
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Filter by date, mobile number or email.
                            </p>
                        </div>

                        <Search
                            size={21}
                            className="text-cyan-400"
                        />

                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                        {/* Exact Date */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Date
                            </label>

                            <div className="relative">
                                <CalendarDays
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        setDate(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* From Date */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                From Date
                            </label>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) =>
                                    setFromDate(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* To Date */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                To Date
                            </label>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) =>
                                    setToDate(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Mobile */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Mobile Number
                            </label>

                            <div className="relative">
                                <Phone
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="text"
                                    value={contactNo}
                                    onChange={(e) =>
                                        setContactNo(e.target.value)
                                    }
                                    placeholder="Search mobile"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Email */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Search email"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Filter Buttons */}

                    <div className="mt-5 flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                        >
                            <Search size={17} />
                            Apply Filters
                        </button>

                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            <X size={17} />
                            Clear Filters
                        </button>

                    </div>

                </div>
            )}

            {/* =================================================
          TABLE
      ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                {/* Table Header */}

                <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Driver Records
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {loading
                                ? "Loading..."
                                : `${filteredDrivers.length} record${filteredDrivers.length === 1 ? "" : "s"
                                } found`}
                        </p>
                    </div>

                </div>

                {/* Responsive Table */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px]">

                        <thead className="border-b border-slate-800 bg-slate-950/60">

                            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">

                                <th className="px-5 py-4">
                                    Sr. No.
                                </th>

                                <th className="px-5 py-4">
                                    Driver
                                </th>

                                <th className="px-5 py-4">
                                    Contact
                                </th>

                                <th className="px-5 py-4">
                                    Type
                                </th>

                                <th className="px-5 py-4">
                                    Status
                                </th>

                                <th className="px-5 py-4">
                                    Reason
                                </th>

                                <th className="px-5 py-4">
                                    Date
                                </th>

                                <th className="px-5 py-4">
                                    Added By
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-5 py-12 text-center text-slate-400"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <RefreshCw
                                                size={18}
                                                className="animate-spin text-cyan-400"
                                            />

                                            Loading drivers...
                                        </div>
                                    </td>
                                </tr>

                            ) : filteredDrivers.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-14 text-center"
                                    >

                                        <div className="mx-auto flex max-w-md flex-col items-center">

                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
                                                <UserRound
                                                    size={25}
                                                    className="text-slate-500"
                                                />
                                            </div>

                                            <h3 className="text-lg font-semibold text-white">
                                                No drivers found
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                No driver records match your current filters.
                                            </p>

                                            <Link
                                                href="/customer-management-driver/add"
                                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                                            >
                                                <Plus size={17} />
                                                Add Driver
                                            </Link>

                                        </div>

                                    </td>
                                </tr>

                            ) : (

                                filteredDrivers.map((driver, index) => (

                                    <tr

                                        key={driver.customerId}
                                        className="border-b border-slate-800 text-white transition hover:bg-slate-800/40"
                                    >

                                        {/* Sr. No. */}
                                        <td className="px-5 py-5">
                                            <span className="font-semibold text-cyan-400">
                                                {index + 1}
                                            </span>
                                        </td>

                                        {/* Driver */}

                                        <td className="px-5 py-5">

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                                                    <UserRound
                                                        size={18}
                                                        className="text-cyan-400"
                                                    />
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="font-semibold text-white">
                                                        {driver.name}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                                        <Mail size={13} />
                                                        {driver.email}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Contact */}

                                        <td className="px-5 py-5">

                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Phone
                                                    size={15}
                                                    className="text-slate-500"
                                                />

                                                {driver.contactNo}
                                            </div>

                                        </td>


                                        {/* Type */}

                                        <td className="px-5 py-5">

                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${driver.type === "Cab"
                                                    ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                                                    : "border-purple-500/20 bg-purple-500/10 text-purple-400"
                                                    }`}
                                            >
                                                {driver.type || "-"}
                                            </span>

                                        </td>





                                        {/* Status */}

                                        <td className="px-5 py-5">

                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    driver.status
                                                )}`}
                                            >
                                                {driver.status}
                                            </span>

                                        </td>

                                        {/* Reason */}

                                        <td className="max-w-[260px] px-5 py-5">

                                            {driver.reason ? (
                                                <p
                                                    className="truncate text-sm text-slate-400"
                                                    title={driver.reason}
                                                >
                                                    {driver.reason}
                                                </p>
                                            ) : (
                                                <span className="text-sm text-slate-600">
                                                    -
                                                </span>
                                            )}

                                        </td>

                                        {/* Date */}

                                        <td className="px-5 py-5">

                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <CalendarDays
                                                    size={15}
                                                    className="text-slate-500"
                                                />

                                                {driver.date}
                                            </div>

                                        </td>

                                        {/* Added By */}

                                        <td className="px-5 py-5">

                                            <div>
                                                <p className="text-sm text-slate-300">
                                                    {driver.createdByName ||
                                                        driver.createdByEmail}
                                                </p>

                                                {driver.createdByName &&
                                                    driver.createdByEmail &&
                                                    driver.createdByName !==
                                                    driver.createdByEmail && (
                                                        <p className="mt-1 text-xs text-slate-600">
                                                            {driver.createdByEmail}
                                                        </p>
                                                    )}
                                            </div>

                                        </td>

                                        {/* Actions */}

                                        <td className="px-5 py-5">

                                            <div className="flex items-center justify-end gap-2">

                                                {/* View */}

                                                <Link
                                                    href={`/customer-management-driver/${driver.customerId}`}
                                                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400"
                                                >
                                                    View
                                                </Link>

                                                {/* Edit */}

                                                <Link
                                                    href={`/customer-management-driver/${driver.customerId}/edit`}
                                                    className="inline-flex items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400 transition hover:bg-cyan-500/20"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </Link>

                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            driver.customerId,
                                                            driver.name
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        driver.customerId
                                                    }
                                                    className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deletingId ===
                                                        driver.customerId ? (
                                                        <RefreshCw
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}