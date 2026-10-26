// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   Building2,
//   HardHat,
//   UserPlus,
// } from "lucide-react";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   async function handleLogin(
//     e: React.FormEvent<HTMLFormElement>
//   ) {
//     e.preventDefault();

//     if (!email.trim() || !password) {
//       alert("Please enter your email and password.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           email: email.trim().toLowerCase(),
//           password,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         alert(
//           data.message ||
//             "Unable to sign in. Please check your credentials."
//         );
//         return;
//       }

//       /*
//        * =====================================================
//        * REDIRECT BASED ON USER PORTAL
//        * =====================================================
//        *
//        * The user does NOT choose the portal.
//        * The portal comes from the account stored in DynamoDB.
//        */

//       const portal = data.user?.portal;

//      if (portal === "construction") {
//   router.replace("/DriWE-Construction/dashboard");
//   return;
// }

//       /*
//        * CRM and existing users without a portal
//        * default to the CRM dashboard.
//        */
//       router.replace("/dashboard");
//     } catch (error) {
//       console.error("Login Error:", error);

//       alert(
//         "Something went wrong while logging in. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">

//       {/* Background */}
//       <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-orange-500/5" />

//       <div className="relative z-10 w-full max-w-md">

//         {/* Logo */}
//         <div className="mb-10 flex flex-col items-center">

//           <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/30">
//             <Building2 className="h-11 w-11 text-black" />
//           </div>

//           <h1 className="text-4xl font-bold tracking-tight text-white">
//             DriWE
//           </h1>

//           <p className="mt-2 text-center text-lg text-slate-400">
//             Sign in to your account
//           </p>

//         </div>

//         {/* Login Card */}
//         <div className="rounded-3xl border border-slate-800 bg-zinc-900 p-10 shadow-2xl">

//           <form
//             onSubmit={handleLogin}
//             className="space-y-6"
//           >

//             {/* Email */}
//             <div>

//               <label className="mb-2 block text-sm text-slate-400">
//                 Email Address
//               </label>

//               <div className="relative">

//                 <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) =>
//                     setEmail(e.target.value)
//                   }
//                   placeholder="you@company.com"
//                   required
//                   autoComplete="email"
//                   className="w-full rounded-2xl border border-slate-700 bg-zinc-950 py-4 pl-11 pr-4 text-white outline-none transition-all focus:border-cyan-500"
//                 />

//               </div>

//             </div>

//             {/* Password */}
//             <div>

//               <label className="mb-2 block text-sm text-slate-400">
//                 Password
//               </label>

//               <div className="relative">

//                 <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

//                 <input
//                   type={
//                     showPassword
//                       ? "text"
//                       : "password"
//                   }
//                   value={password}
//                   onChange={(e) =>
//                     setPassword(e.target.value)
//                   }
//                   placeholder="••••••••"
//                   required
//                   autoComplete="current-password"
//                   className="w-full rounded-2xl border border-slate-700 bg-zinc-950 py-4 pl-11 pr-12 text-white outline-none transition-all focus:border-cyan-500"
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowPassword(
//                       (value) => !value
//                     )
//                   }
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
//                   aria-label={
//                     showPassword
//                       ? "Hide password"
//                       : "Show password"
//                   }
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>

//               </div>

//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-lg font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {isLoading
//                 ? "Signing in..."
//                 : "Sign In"}
//             </button>

//           </form>

//           {/* Construction Signup */}
//           <div className="mt-8 border-t border-slate-800 pt-6">

//             <div className="mb-4 text-center">
//               <p className="text-sm text-slate-500">
//                 New to DriWE Construction?
//               </p>
//             </div>

//             <Link
//               href="/construction-signup"
//               className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 py-3.5 font-semibold text-orange-400 transition hover:border-orange-500/50 hover:bg-orange-500/15 hover:text-orange-300"
//             >
//               <HardHat size={18} />
//               <UserPlus size={18} />
//               Create Construction Account
//             </Link>

//             <p className="mt-3 text-center text-xs text-slate-600">
//               Construction candidates can create their own
//               account. DriWE CRM accounts are created by an
//               administrator.
//             </p>

//           </div>

//         </div>

//         {/* Footer */}
//         <div className="mt-8 text-center">
//           <p className="text-xs text-slate-600">
//             © {new Date().getFullYear()} DriWE
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }

























// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   HardHat,
//   UserPlus,
// } from "lucide-react";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   async function handleLogin(
//     e: React.FormEvent<HTMLFormElement>
//   ) {
//     e.preventDefault();

//     if (!email.trim() || !password) {
//       alert("Please enter your email and password.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           email: email.trim().toLowerCase(),
//           password,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         alert(
//           data.message ||
//             "Unable to sign in. Please check your credentials."
//         );
//         return;
//       }

//       const portal = data.user?.portal;

//       if (portal === "construction") {
//         router.replace("/DriWE-Construction/dashboard");
//         return;
//       }

//       alert(
//         "This login page is currently for DriWE Construction CRM accounts only."
//       );
//     } catch (error) {
//       console.error("Login Error:", error);

//       alert(
//         "Something went wrong while logging in. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">
//       {/* Background */}
//       <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-yellow-500/5 to-amber-500/10" />

//       <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

//       <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />

//       <div className="relative z-10 w-full max-w-md">
//         {/* Branding */}
//         <div className="mb-10 flex flex-col items-center">
//           <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-400 to-amber-500 shadow-2xl shadow-orange-500/20">
//             <HardHat className="h-11 w-11 text-black" />
//           </div>

//           <h1 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
//             DriWE Construction CRM
//           </h1>

//           <p className="mt-3 text-center text-sm text-zinc-400">
//             Construction Project Management Portal
//           </p>
//         </div>

//         {/* Login Card */}
//         <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-7 shadow-2xl backdrop-blur sm:p-10">
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-white">
//               Welcome Back
//             </h2>

//             <p className="mt-2 text-sm text-zinc-400">
//               Sign in to manage your construction projects.
//             </p>
//           </div>

//           {/* Login Form */}
//           <form onSubmit={handleLogin} className="space-y-6">
//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-2 block text-sm font-medium text-zinc-300"
//               >
//                 Email Address
//               </label>

//               <div className="relative">
//                 <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@company.com"
//                   required
//                   autoComplete="email"
//                   className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="mb-2 block text-sm font-medium text-zinc-300"
//               >
//                 Password
//               </label>

//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   required
//                   autoComplete="current-password"
//                   className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowPassword((value) => !value)
//                   }
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
//                   aria-label={
//                     showPassword ? "Hide password" : "Show password"
//                   }
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Sign In Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-base font-semibold text-black transition hover:from-orange-400 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {isLoading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>

//           {/* Signup Section */}
//           <div className="mt-8 border-t border-zinc-800 pt-6">
//             <p className="mb-4 text-center text-sm text-zinc-400">
//               New to DriWE Construction?
//             </p>

//             <Link
//               href="/construction-signup"
//               className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 py-3.5 font-semibold text-orange-400 transition hover:border-orange-500/50 hover:bg-orange-500/15 hover:text-orange-300"
//             >
//               <HardHat className="h-5 w-5" />
//               <UserPlus className="h-5 w-5" />
//               Create Construction Account
//             </Link>

//             <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
//               Create your account to get started with DriWE
//               Construction CRM.
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 text-center">
//           <p className="text-xs text-zinc-600">
//             © {new Date().getFullYear()} DriWE Construction CRM
//           </p>

//           <p className="mt-2 text-xs text-zinc-700">
//             DriWE Smartech Pvt. Ltd.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }










"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  HardHat,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Unable to sign in. Please check your credentials."
        );
        return;
      }

      const portal = data.user?.portal;

      if (portal === "construction") {
        router.replace("/DriWE-Construction/dashboard");
        return;
      }

      alert(
        "This login page is currently for DriWE Construction CRM accounts only."
      );
    } catch (error) {
      console.error("Login Error:", error);

      alert("Something went wrong while logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-4 py-8 text-black sm:px-6 lg:px-10">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.09),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(0,0,0,0.035),_transparent_40%)]" />

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-gray-100 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 lg:grid-cols-[1fr_0.9fr]">
        {/* Left branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gray-50 p-10 lg:flex xl:p-14">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gray-200/60 blur-3xl" />

          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
              <HardHat className="h-7 w-7" />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
              DriWE Smartech Pvt. Ltd.
            </p>

            <h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight tracking-tight text-black xl:text-5xl">
              Build smarter.
              <br />
              Manage better.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-gray-600">
              Your central workspace for construction projects, teams,
              company information, and day-to-day operations.
            </p>
          </div>

          <div className="relative mt-12 space-y-4">
            <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <Building2 className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black">
                  Project management
                </h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Keep your construction work organised in one place.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <ShieldCheck className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black">
                  Secure workspace
                </h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Access your construction portal using your account.
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-12 border-t border-gray-200 pt-5">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} DriWE Construction CRM
            </p>
          </div>
        </section>

        {/* Right login panel */}
        <section className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14">
          {/* Mobile branding */}
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-black">
                DriWE Construction CRM
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">
                Construction Project Management Portal
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Construction Portal
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Sign in to access your construction projects and workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-black outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-black focus:ring-4 focus:ring-gray-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-12 text-sm text-black outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-black focus:ring-4 focus:ring-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md text-gray-400 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in to your account"}
              {!isLoading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">
              NEW ACCOUNT
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                <UserPlus className="h-5 w-5 text-black" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-black">
                  New to DriWE Construction?
                </h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Create your construction account to get started.
                </p>
              </div>
            </div>

            <Link
              href="/construction-signup"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-gray-100"
            >
              <HardHat className="h-4 w-4" />
              Create Construction Account
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} DriWE Construction CRM
            </p>
            <p className="mt-1.5 text-xs text-gray-400">
              DriWE Smartech Pvt. Ltd.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
