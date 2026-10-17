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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
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

      alert(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-yellow-500/5 to-amber-500/10" />

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-400 to-amber-500 shadow-2xl shadow-orange-500/20">
            <HardHat className="h-11 w-11 text-black" />
          </div>

          <h1 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            DriWE Construction CRM
          </h1>

          <p className="mt-3 text-center text-sm text-zinc-400">
            Construction Project Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-7 shadow-2xl backdrop-blur sm:p-10">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Sign in to manage your construction projects.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-base font-semibold text-black transition hover:from-orange-400 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Signup Section */}
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <p className="mb-4 text-center text-sm text-zinc-400">
              New to DriWE Construction?
            </p>

            <Link
              href="/construction-signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 py-3.5 font-semibold text-orange-400 transition hover:border-orange-500/50 hover:bg-orange-500/15 hover:text-orange-300"
            >
              <HardHat className="h-5 w-5" />
              <UserPlus className="h-5 w-5" />
              Create Construction Account
            </Link>

            <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
              Create your account to get started with DriWE
              Construction CRM.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} DriWE Construction CRM
          </p>

          <p className="mt-2 text-xs text-zinc-700">
            DriWE Smartech Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
