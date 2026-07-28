"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  CalendarDays,
  Loader2,
} from "lucide-react";

type DriverStatus = "Accept" | "Reject" | "Hold";

interface CustomerDriver {
  customerId: string;
  name: string;
  email: string;
  contactNo: string;
  status: DriverStatus;
  reason?: string;
  date: string;

  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;

  createdAt?: string;
  updatedAt?: string;
}

export default function EditCustomerDriverPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params?.customerId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [status, setStatus] = useState<DriverStatus>("Accept");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (customerId) {
      loadDriver();
    }
  }, [customerId]);

  async function loadDriver() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/customer-management-driver/${customerId}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch driver"
        );
      }

      const driver: CustomerDriver =
        data.customer || data.driver;

      if (!driver) {
        throw new Error("Driver not found");
      }

      setName(driver.name || "");
      setEmail(driver.email || "");
      setContactNo(driver.contactNo || "");
      setStatus(driver.status || "Accept");
      setReason(driver.reason || "");
      setDate(driver.date || "");
    } catch (error) {
      console.error("Load driver error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load driver"
      );

      router.push("/customer-management-driver");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter driver name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter email.");
      return;
    }

    if (!contactNo.trim()) {
      alert("Please enter contact number.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (
      (status === "Reject" || status === "Hold") &&
      !reason.trim()
    ) {
      alert(
        `Please provide a reason when status is ${status}.`
      );
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `/api/customer-management-driver/${customerId}`,
        {
          method: "PUT",
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
              status === "Reject" || status === "Hold"
                ? reason.trim()
                : "",
            date,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update driver"
        );
      }

      alert("Driver updated successfully.");

      router.push(
        `/customer-management-driver/${customerId}`
      );

      router.refresh();
    } catch (error) {
      console.error("Update driver error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update driver"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading driver...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href={`/customer-management-driver/${customerId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft size={17} />
          Back to Driver
        </Link>

        <h1 className="text-3xl font-bold text-white">
          Edit Driver
        </h1>

        <p className="mt-1 text-slate-400">
          Update Customer Management (Driver) information.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl lg:p-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter driver name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
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
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Contact No
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="tel"
                value={contactNo}
                onChange={(e) =>
                  setContactNo(e.target.value)
                }
                placeholder="Enter contact number"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as DriverStatus)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            >
              <option value="Accept">Accept</option>
              <option value="Reject">Reject</option>
              <option value="Hold">Hold</option>
            </select>
          </div>

          {/* Reason */}
          {(status === "Reject" || status === "Hold") && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Reason
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  status === "Reject"
                    ? "Enter reason for rejecting this driver..."
                    : "Enter reason for putting this driver on hold..."
                }
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                A reason is required when the status is{" "}
                {status}.
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-6">
          <Link
            href={`/customer-management-driver/${customerId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}