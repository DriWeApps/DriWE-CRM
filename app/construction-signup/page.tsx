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
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ConstructionSignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
          portal: "construction",
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await res.text();

        console.error(
          "Construction signup API returned non-JSON:",
          responseText
        );

        alert(
          "The signup service returned an unexpected response. Please check the API route."
        );
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message || "Unable to create your Construction account."
        );
        return;
      }

      alert("Construction account created successfully. Please login.");
      router.push("/login");
    } catch (error) {
      console.error("Construction signup error:", error);

      alert(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100";

  const inputWithIconClass =
    "w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-black placeholder:text-gray-400 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClass = "mb-2 block text-sm font-medium text-gray-800";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500";

  const sectionClass =
    "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";

  return (
  <main className="min-h-screen w-full bg-gray-50 px-3 py-4 text-black sm:px-6 sm:py-6 lg:px-8">
  <div className="w-full min-w-0">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-100"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-black underline underline-offset-4 transition hover:text-gray-600"
            >
              Sign in
            </Link>
          </p>
        </header>

        {/* Main card */}
       <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Title banner */}
          <div className="border-b border-gray-200 bg-white px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <HardHat className="h-7 w-7" />
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    DriWE Smartech Pvt. Ltd.
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                    Construction Portal
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                    Register your account and company details to access the
                    DriWE Construction platform.
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                <ShieldCheck className="h-4 w-4 text-black" />
                Account Registration
              </div>
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Registration form */}
           <div className="w-full min-w-0 p-4 sm:p-8 lg:p-10">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-black" />
                  <h2 className="text-xl font-bold text-black">
                    Create your account
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Fields marked with <span className="text-red-600">*</span>{" "}
                  are required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Personal information */}
                <section className={sectionClass}>
                  <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                      <User className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">
                        Personal Information
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Your contact and login details
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className={labelClass}>
                        First Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Enter first name"
                        autoComplete="given-name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className={labelClass}>
                        Last Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Enter last name"
                        autoComplete="family-name"
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="email" className={labelClass}>
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={17} className={iconClass} />
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          autoComplete="email"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="contactNo" className={labelClass}>
                        Contact Number <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={17} className={iconClass} />
                        <input
                          id="contactNo"
                          type="tel"
                          name="contactNo"
                          value={form.contactNo}
                          onChange={handleChange}
                          required
                          placeholder="Enter contact number"
                          autoComplete="tel"
                          inputMode="tel"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Company information */}
                <section className={sectionClass}>
                  <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                      <Building2 className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">
                        Company Information
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Enter your registered business details
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="companyName" className={labelClass}>
                        Company Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Building2 size={17} className={iconClass} />
                        <input
                          id="companyName"
                          type="text"
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          required
                          placeholder="Enter company name"
                          autoComplete="organization"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="companyGSTNo" className={labelClass}>
                          Company GST No.{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <FileText size={17} className={iconClass} />
                          <input
                            id="companyGSTNo"
                            type="text"
                            name="companyGSTNo"
                            value={form.companyGSTNo}
                            onChange={handleChange}
                            required
                            placeholder="Enter GST number"
                            autoComplete="off"
                            className={`${inputWithIconClass} uppercase`}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="companyPANNo" className={labelClass}>
                          Company PAN No.{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <FileText size={17} className={iconClass} />
                          <input
                            id="companyPANNo"
                            type="text"
                            name="companyPANNo"
                            value={form.companyPANNo}
                            onChange={handleChange}
                            required
                            placeholder="Enter PAN number"
                            autoComplete="off"
                            className={`${inputWithIconClass} uppercase`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pincode" className={labelClass}>
                        Pincode <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <MapPin size={17} className={iconClass} />
                        <input
                          id="pincode"
                          type="text"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleChange}
                          required
                          placeholder="6-digit pincode"
                          inputMode="numeric"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          autoComplete="postal-code"
                          className={inputWithIconClass}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Password */}
                <section className={sectionClass}>
                  <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                      <Lock className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">
                        Account Password
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Choose a password with at least 6 characters
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Lock size={17} className={iconClass} />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                          className={`${inputWithIconClass} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className={labelClass}>
                        Confirm Password{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Lock size={17} className={iconClass} />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                          className={`${inputWithIconClass} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
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
                </section>

                {/* Account type */}
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Construction Portal Account
                    </p>
                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      Your registration will create an account for the DriWE
                      Construction platform.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Construction Account
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-gray-500">
                  Please ensure your personal and company details are accurate
                  before submitting your registration.
                </p>
              </form>
            </div>

            {/* Information panel */}
            <aside className="border-t border-gray-200 bg-gray-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Registration Overview
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Complete the form to register your company and create your
                Construction Portal account.
              </p>

              <div className="mt-7 space-y-5">
                {[
                  "Provide your personal contact details",
                  "Enter your company registration information",
                  "Create and confirm your password",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                    <p className="text-sm leading-5 text-gray-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-black" />
                  <p className="text-sm font-semibold text-black">
                    Registration Details
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Use a valid email address and accurate company details so
                  your account information can be recorded correctly.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DriWE Smartech Pvt. Ltd. All rights
            reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
