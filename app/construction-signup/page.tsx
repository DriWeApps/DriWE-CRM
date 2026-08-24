"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  HardHat,
  Building2,
  FileText,
  MapPin,
} from "lucide-react";

export default function ConstructionSignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    companyName: "",
    companyGSTNo: "",
    companyPANNo: "",
    pincode: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!form.firstName.trim()) {
      alert("Please enter your first name.");
      return;
    }

    if (!form.lastName.trim()) {
      alert("Please enter your last name.");
      return;
    }

    if (!form.email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!form.contactNo.trim()) {
      alert("Please enter your contact number.");
      return;
    }

    if (!form.companyName.trim()) {
      alert("Please enter your company name.");
      return;
    }

    if (!form.companyGSTNo.trim()) {
      alert("Please enter your company GST number.");
      return;
    }

    if (!form.companyPANNo.trim()) {
      alert("Please enter your company PAN number.");
      return;
    }

    if (!form.pincode.trim()) {
      alert("Please enter your pincode.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      alert("Pincode must be exactly 6 digits.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/construction-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          contactNo: form.contactNo.trim(),
          companyName: form.companyName.trim(),
          companyGSTNo: form.companyGSTNo.trim().toUpperCase(),
          companyPANNo: form.companyPANNo.trim().toUpperCase(),
          pincode: form.pincode.trim(),
          password: form.password,

          /*
           * Portal is controlled/validated by the server.
           */
          portal: "construction",
        }),
      });

      /*
       * Prevent JSON parsing errors when the API returns HTML.
       */
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();

        console.error(
          "Construction signup API returned non-JSON:",
          text
        );

        alert(
          "The signup service returned an unexpected response. Please check the API route."
        );

        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Unable to create your Construction account."
        );

        return;
      }

      alert(
        "Construction account created successfully. Please login."
      );

      router.push("/login");
    } catch (error) {
      console.error(
        "Construction signup error:",
        error
      );

      alert(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent" />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <Link
            href="/login"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Already have an account?{" "}
            <span className="font-medium text-orange-400">
              Sign in
            </span>
          </Link>
        </div>

        {/* =====================================================
            MAIN CARD
        ====================================================== */}
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="grid lg:grid-cols-5">
            {/* =================================================
                LEFT INFORMATION
            ================================================== */}
            <div className="border-b border-zinc-800 bg-gradient-to-br from-orange-500/10 via-zinc-900 to-zinc-950 p-8 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 shadow-xl shadow-orange-500/20">
                <HardHat className="h-8 w-8 text-black" />
              </div>

              <h1 className="mt-8 text-3xl font-bold">
                Construction Portal
              </h1>

              <p className="mt-4 leading-7 text-zinc-400">
                Create your Construction account and get
                access to the DriWE Construction platform.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-400" />

                  <p className="text-sm text-zinc-400">
                    Manage construction-related activities
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-400" />

                  <p className="text-sm text-zinc-400">
                    Access your Construction dashboard
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-400" />

                  <p className="text-sm text-zinc-400">
                    Use your account to sign in anytime
                  </p>
                </div>
              </div>

              {/* Account information */}
              <div className="mt-10 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <p className="text-sm font-medium text-orange-400">
                  Construction Account
                </p>

                <p className="mt-2 text-xs leading-5 text-orange-200/60">
                  Your registration information will be
                  used to create your Construction portal
                  account.
                </p>
              </div>
            </div>

            {/* =================================================
                SIGNUP FORM
            ================================================== */}
            <div className="p-6 sm:p-8 lg:col-span-3 lg:p-10">
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <UserPlus
                    size={24}
                    className="text-orange-400"
                  />

                  <h2 className="text-2xl font-semibold">
                    Create Account
                  </h2>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Enter your personal and company details
                  to create your Construction account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* =================================================
                    FIRST NAME / LAST NAME
                ================================================== */}
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      First Name *
                    </label>

                    <div className="relative">
                      <User
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                      />

                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder="First name"
                        autoComplete="given-name"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Last Name *
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Last name"
                      autoComplete="family-name"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-white outline-none transition focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* =================================================
                    EMAIL
                ================================================== */}
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Email Address *
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* =================================================
                    CONTACT NUMBER
                ================================================== */}
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Contact Number *
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    />

                    <input
                      type="tel"
                      name="contactNo"
                      value={form.contactNo}
                      onChange={handleChange}
                      required
                      placeholder="9876543210"
                      autoComplete="tel"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* =================================================
                    COMPANY DETAILS
                ================================================== */}
                <div className="border-t border-zinc-800 pt-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Building2
                      size={19}
                      className="text-orange-400"
                    />

                    <h3 className="text-sm font-semibold text-zinc-200">
                      Company Details
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {/* Company Name */}
                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Company Name *
                      </label>

                      <div className="relative">
                        <Building2
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                          type="text"
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          required
                          placeholder="Company name"
                          autoComplete="organization"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* GST + PAN */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* GST */}
                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Company GST No *
                        </label>

                        <div className="relative">
                          <FileText
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                          />

                          <input
                            type="text"
                            name="companyGSTNo"
                            value={form.companyGSTNo}
                            onChange={handleChange}
                            required
                            placeholder="GST number"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 uppercase text-white outline-none transition focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* PAN */}
                      <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                          Company PAN No *
                        </label>

                        <div className="relative">
                          <FileText
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                          />

                          <input
                            type="text"
                            name="companyPANNo"
                            value={form.companyPANNo}
                            onChange={handleChange}
                            required
                            placeholder="PAN number"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 uppercase text-white outline-none transition focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Pincode *
                      </label>

                      <div className="relative">
                        <MapPin
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                          type="text"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleChange}
                          required
                          placeholder="400001"
                          inputMode="numeric"
                          maxLength={6}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    PASSWORD
                ================================================== */}
                <div className="border-t border-zinc-800 pt-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Lock
                      size={19}
                      className="text-orange-400"
                    />

                    <h3 className="text-sm font-semibold text-zinc-200">
                      Account Password
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Password */}
                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Password *
                      </label>

                      <div className="relative">
                        <Lock
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-12 text-white outline-none transition focus:border-orange-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="mb-2 block text-sm text-zinc-300">
                        Confirm Password *
                      </label>

                      <div className="relative">
                        <Lock
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Confirm password"
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3.5 pl-11 pr-12 text-white outline-none transition focus:border-orange-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (value) => !value
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ACCOUNT TYPE
                ================================================== */}
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-sm font-medium text-orange-400">
                    Account Type
                  </p>

                  <p className="mt-1 text-sm text-orange-200/70">
                    Your account will be created for the
                    Construction portal.
                  </p>
                </div>

                {/* =================================================
                    SUBMIT
                ================================================== */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-3.5 font-semibold text-black transition hover:from-orange-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Construction Account"}
                </button>

                <p className="text-center text-xs text-zinc-600">
                  By creating an account, you agree to use
                  the Construction platform responsibly.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} DriWE
          </p>
        </div>
      </div>
    </div>
  );
}