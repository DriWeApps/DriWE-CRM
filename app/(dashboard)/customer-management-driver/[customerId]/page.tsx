"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
} from "lucide-react";

interface CustomerDriver {
  customerId: string;
  name: string;
  email: string;
  contactNo: string;
  status: "Accept" | "Reject" | "Hold";
  reason?: string;
  date: string;

  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;

  createdAt?: string;
  updatedAt?: string;
}

export default function CustomerDriverDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params?.customerId as string;

  const [customer, setCustomer] = useState<CustomerDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  async function loadCustomer() {
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
        throw new Error(data.message || "Failed to load driver");
      }

      setCustomer(data.customer || data.driver);
    } catch (error) {
      console.error("Load customer driver error:", error);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/customer-management-driver/${customer.customerId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete driver");
        return;
      }

      alert("Driver deleted successfully");

      router.push("/customer-management-driver");
      router.refresh();
    } catch (error) {
      console.error("Delete customer driver error:", error);
      alert("Failed to delete driver");
    } finally {
      setDeleting(false);
    }
  }

  function getStatusStyle(status: CustomerDriver["status"]) {
    switch (status) {
      case "Accept":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "Reject":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "Hold":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  }

  function getStatusIcon(status: CustomerDriver["status"]) {
    switch (status) {
      case "Accept":
        return <CheckCircle2 size={18} />;

      case "Reject":
        return <XCircle size={18} />;

      case "Hold":
        return <Clock3 size={18} />;

      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading driver details...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h1 className="text-xl font-semibold text-white">
            Driver not found
          </h1>

          <p className="mt-2 text-slate-400">
            The driver may have been deleted or you may not have permission
            to view it.
          </p>

          <Link
            href="/customer-management-driver"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <ArrowLeft size={18} />
            Back to Drivers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/customer-management-driver"
            className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Drivers
          </Link>

          <h1 className="text-3xl font-bold text-white">
            {customer.name}
          </h1>

          <p className="mt-1 text-slate-400">
            Customer Management (Driver)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/customer-management-driver/${customer.customerId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Pencil size={17} />
            Edit
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}

            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Main Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <User className="h-8 w-8 text-cyan-400" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            {customer.name}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Driver / Customer
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${getStatusStyle(
              customer.status
            )}`}
          >
            {getStatusIcon(customer.status)}
            {customer.status}
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Contact Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-cyan-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all font-medium text-white">
                    {customer.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Contact Number
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {customer.contactNo || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-yellow-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {customer.date || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Added By
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {customer.createdByName ||
                      customer.createdByEmail ||
                      "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold text-white">
          Status
        </h2>

        <div
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-medium ${getStatusStyle(
            customer.status
          )}`}
        >
          {getStatusIcon(customer.status)}
          {customer.status}
        </div>

        {/* Reason */}
        {(customer.status === "Reject" ||
          customer.status === "Hold") && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm font-medium text-slate-400">
              Reason
            </p>

            <p className="mt-2 whitespace-pre-wrap text-white">
              {customer.reason || "No reason provided."}
            </p>
          </div>
        )}
      </div>

      {/* Record Information */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold text-white">
          Record Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">
              Customer ID
            </p>

            <p className="mt-1 break-all font-mono text-sm text-slate-300">
              {customer.customerId}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Created By Email
            </p>

            <p className="mt-1 text-sm text-slate-300">
              {customer.createdByEmail || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Created At
            </p>

            <p className="mt-1 text-sm text-slate-300">
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleString("en-GB")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Last Updated
            </p>

            <p className="mt-1 text-sm text-slate-300">
              {customer.updatedAt
                ? new Date(customer.updatedAt).toLocaleString("en-GB")
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-6">
        <Link
          href="/customer-management-driver"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <Link
          href={`/customer-management-driver/${customer.customerId}/edit`}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
        >
          <Pencil size={17} />
          Edit Driver
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Trash2 size={17} />
          )}

          {deleting ? "Deleting..." : "Delete Driver"}
        </button>
      </div>
    </div>
  );
}