"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  CalendarDays,
  MapPin,
  Hash,
  Globe,
  Cake,
  VenusAndMars,
  CircleCheck,
  Clock3,
} from "lucide-react";

interface Profile {
  firstName?: string;
  lastName?: string;

  email?: string;
  mobile?: string;

  designation?: string;
  department?: string;
  role?: string;
  status?: string;

  joiningDate?: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  dateOfBirth?: string;
  gender?: string;

  employeeId?: string;
  userId?: string;

  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/settings/profile", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        console.error("Failed to fetch profile:", data);
        return;
      }

      setProfile(data.user);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setPageLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
          Failed to load profile information.
        </div>
      </div>
    );
  }

  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
    "Employee";

  const initials =
    `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`
      .toUpperCase() || "U";

  function formatDate(value?: string) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(value?: string) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="w-full p-6">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-8 flex items-center gap-4">

        <Link
          href="/settings"
          className="rounded-xl border border-slate-800 bg-slate-950 p-2 transition hover:bg-slate-800"
        >
          <ArrowLeft
            className="text-white"
            size={18}
          />
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white">
            My Profile
          </h1>

          <p className="text-slate-400">
            View your complete employee information
          </p>
        </div>

      </div>

      {/* =========================================
          PROFILE MAIN CARD
      ========================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

        {/* =========================================
            PROFILE HEADER
        ========================================= */}

        <div className="border-b border-slate-800 bg-slate-900/60 p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Avatar */}

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-3xl font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              {initials}
            </div>

            <div>

              <h2 className="text-3xl font-bold text-white">
                {fullName}
              </h2>

              <p className="mt-1 text-lg text-cyan-400">
                {profile.designation || "Employee"}
              </p>

              {profile.department && (
                <p className="mt-1 text-sm text-slate-500">
                  {profile.department}
                </p>
              )}

              {profile.status && (
                <div className="mt-3">

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      profile.status.toLowerCase() === "active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    <CircleCheck size={14} />

                    {profile.status}
                  </span>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* =========================================
            EMPLOYEE DETAILS
        ========================================= */}

        <div className="p-8">

          <h2 className="mb-6 text-xl font-semibold text-white">
            Employee Details
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* First Name */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <User
                  size={20}
                  className="text-cyan-400"
                />

                <span className="text-sm text-slate-400">
                  First Name
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.firstName || "-"}
              </p>

            </div>

            {/* Last Name */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <User
                  size={20}
                  className="text-cyan-400"
                />

                <span className="text-sm text-slate-400">
                  Last Name
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.lastName || "-"}
              </p>

            </div>

            {/* Email */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Mail
                  size={20}
                  className="text-green-400"
                />

                <span className="text-sm text-slate-400">
                  Email Address
                </span>

              </div>

              <p className="break-all text-lg font-medium text-white">
                {profile.email || "-"}
              </p>

            </div>

            {/* Mobile */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Phone
                  size={20}
                  className="text-yellow-400"
                />

                <span className="text-sm text-slate-400">
                  Mobile Number
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.mobile || "-"}
              </p>

            </div>

            {/* Designation */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Briefcase
                  size={20}
                  className="text-purple-400"
                />

                <span className="text-sm text-slate-400">
                  Designation
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.designation || "-"}
              </p>

            </div>

            {/* Department */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Building2
                  size={20}
                  className="text-blue-400"
                />

                <span className="text-sm text-slate-400">
                  Department
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.department || "-"}
              </p>

            </div>

            {/* Role */}

            {/* <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <ShieldCheck
                  size={20}
                  className="text-cyan-400"
                />

                <span className="text-sm text-slate-400">
                  Role
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.role || "-"}
              </p>

            </div> */}

            {/* Status */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <CircleCheck
                  size={20}
                  className="text-green-400"
                />

                <span className="text-sm text-slate-400">
                  Status
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.status || "-"}
              </p>

            </div>

            {/* Joining Date */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <CalendarDays
                  size={20}
                  className="text-yellow-400"
                />

                <span className="text-sm text-slate-400">
                  Joining Date
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {formatDate(profile.joiningDate)}
              </p>

            </div>

            {/* Date of Birth */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Cake
                  size={20}
                  className="text-pink-400"
                />

                <span className="text-sm text-slate-400">
                  Date of Birth
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {formatDate(profile.dateOfBirth)}
              </p>

            </div>

            {/* Gender */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <VenusAndMars
                  size={20}
                  className="text-purple-400"
                />

                <span className="text-sm text-slate-400">
                  Gender
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.gender || "-"}
              </p>

            </div>

          </div>

        </div>

        {/* =========================================
            ADDRESS
        ========================================= */}

        <div className="border-t border-slate-800 p-8">

          <h2 className="mb-6 text-xl font-semibold text-white">
            Address Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Address */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-2">

              <div className="mb-3 flex items-center gap-3">

                <MapPin
                  size={20}
                  className="text-red-400"
                />

                <span className="text-sm text-slate-400">
                  Address
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.address || "-"}
              </p>

            </div>

            {/* City */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <p className="mb-2 text-sm text-slate-400">
                City
              </p>

              <p className="text-lg font-medium text-white">
                {profile.city || "-"}
              </p>

            </div>

            {/* State */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <p className="mb-2 text-sm text-slate-400">
                State
              </p>

              <p className="text-lg font-medium text-white">
                {profile.state || "-"}
              </p>

            </div>

            {/* Pincode */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Hash
                  size={20}
                  className="text-orange-400"
                />

                <span className="text-sm text-slate-400">
                  Pincode
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.pincode || "-"}
              </p>

            </div>

            {/* Country */}

            {/* <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Globe
                  size={20}
                  className="text-blue-400"
                />

                <span className="text-sm text-slate-400">
                  Country
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {profile.country || "-"}
              </p>

            </div> */}






          </div>

        </div>

        {/* =========================================
            SYSTEM INFORMATION
        ========================================= */}

        <div className="border-t border-slate-800 p-8">

          <h2 className="mb-6 text-xl font-semibold text-white">
            Account Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Employee ID */}

            {/* <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Hash
                  size={20}
                  className="text-cyan-400"
                />

                <span className="text-sm text-slate-400">
                  Employee ID
                </span>

              </div>

              <p className="break-all text-sm font-medium text-white">
                {profile.employeeId || "-"}
              </p>

            </div> */}

            {/* User ID */}

            {/* <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <ShieldCheck
                  size={20}
                  className="text-purple-400"
                />

                <span className="text-sm text-slate-400">
                  User ID
                </span>

              </div>

              <p className="break-all text-sm font-medium text-white">
                {profile.userId || "-"}
              </p>

            </div> */}

            {/* Created At */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Clock3
                  size={20}
                  className="text-green-400"
                />

                <span className="text-sm text-slate-400">
                  Account Created
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {formatDateTime(profile.createdAt)}
              </p>

            </div>

            {/* Updated At */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-3 flex items-center gap-3">

                <Clock3
                  size={20}
                  className="text-yellow-400"
                />

                <span className="text-sm text-slate-400">
                  Last Updated
                </span>

              </div>

              <p className="text-lg font-medium text-white">
                {formatDateTime(profile.updatedAt)}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}