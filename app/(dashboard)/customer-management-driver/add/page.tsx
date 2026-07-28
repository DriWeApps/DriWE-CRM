"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
} from "lucide-react";

type Status = "Accept" | "Reject" | "Hold";

export default function AddCustomerManagementDriverPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [status, setStatus] = useState<Status>("Accept");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    /* -----------------------------------------------
       Frontend validation
    ------------------------------------------------ */

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!contactNo.trim()) {
      setError("Contact number is required.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    if (
      (status === "Reject" || status === "Hold") &&
      !reason.trim()
    ) {
      setError(
        "Reason is required when status is Reject or Hold."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customer-management-driver",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            contactNo: contactNo.trim(),
            status,
            reason:
              status === "Accept"
                ? ""
                : reason.trim(),
            date,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to add driver"
        );
      }

      alert("Driver added successfully.");

      router.push("/customer-management-driver");
      router.refresh();
    } catch (error) {
      console.error(
        "Add Driver Error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add driver."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     STATUS CHANGE
  ===================================================== */

  function handleStatusChange(
    value: Status
  ) {
    setStatus(value);

    /*
     * If Accept is selected, remove the reason
     * because it is not required.
     */
    if (value === "Accept") {
      setReason("");
    }
  }

  return (
    <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Link
            href="/customer-management-driver"
            className="mb-3 inline-flex items-center gap-2 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Customer Management
          </Link>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Add Driver
          </h1>

          <p className="mt-1 text-sm text-slate-400 sm:text-base">
            Add a new driver/customer record.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
          <UserPlus className="text-cyan-400" size={23} />
        </div>

      </div>

      {/* =================================================
          FORM CARD
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl"
      >

        {/* Form Header */}

        <div className="border-b border-slate-800 px-5 py-5 sm:px-7">
          <h2 className="text-lg font-semibold text-white">
            Driver Information
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Enter the driver's basic information and status.
          </p>
        </div>

        {/* Form Body */}

        <div className="space-y-7 p-5 sm:p-7">

          {/* =================================================
              NAME
          ================================================= */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Name
              <span className="ml-1 text-red-400">*</span>
            </label>

            <div className="relative">
              <UserPlus
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter driver name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* =================================================
              EMAIL + CONTACT
          ================================================= */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="driver@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact */}

            <div>
              <label
                htmlFor="contactNo"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Contact No
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="contactNo"
                  type="tel"
                  value={contactNo}
                  onChange={(e) =>
                    setContactNo(e.target.value)
                  }
                  placeholder="Enter contact number"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>

          </div>

          {/* =================================================
              STATUS + DATE
          ================================================= */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* Status */}

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Status
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                {status === "Accept" && (
                  <CheckCircle2
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400"
                  />
                )}

                {status === "Reject" && (
                  <XCircle
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                  />
                )}

                {status === "Hold" && (
                  <Clock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400"
                  />
                )}

                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    handleStatusChange(
                      e.target.value as Status
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  disabled={loading}
                >
                  <option value="Accept">
                    Accept
                  </option>

                  <option value="Reject">
                    Reject
                  </option>

                  <option value="Hold">
                    Hold
                  </option>
                </select>
              </div>
            </div>

            {/* Date */}

            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Date
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  disabled={loading}
                />
              </div>
            </div>

          </div>

          {/* =================================================
              REASON
          ================================================= */}

          <div>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Reason

              {(status === "Reject" ||
                status === "Hold") && (
                <span className="ml-1 text-red-400">
                  *
                </span>
              )}
            </label>

            <textarea
              id="reason"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder={
                status === "Reject"
                  ? "Enter reason for rejection..."
                  : status === "Hold"
                    ? "Enter reason for putting this driver on hold..."
                    : "Optional reason..."
              }
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={loading}
            />

            <p className="mt-2 text-xs text-slate-500">
              {status === "Reject" ||
              status === "Hold"
                ? "Reason is required for this status."
                : "Reason is optional for Accept."}
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

        </div>

        {/* =================================================
            FORM FOOTER
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">

          <Link
            href="/customer-management-driver"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />

            {loading
              ? "Saving..."
              : "Save Driver"}
          </button>

        </div>

      </form>
    </div>
  );
}