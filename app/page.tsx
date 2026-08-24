// import Link from "next/link";
// import {
//   ArrowRight,
//   Building2,
//   Lightbulb,
//   Zap,
//   Target,
//   ShieldCheck,
// } from "lucide-react";

// export default function Home() {
//   return (
//     <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
//       {/* =========================================================
//           BACKGROUND
//       ========================================================== */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         {/* Main Yellow Glow */}
//         <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-yellow-400/10 blur-[130px]" />

//         {/* Right Yellow Glow */}
//         <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-yellow-300/10 blur-[150px]" />

//         {/* Bottom Yellow Glow */}
//         <div className="absolute bottom-[-250px] left-1/4 h-[600px] w-[600px] rounded-full bg-yellow-400/5 blur-[140px]" />

//         {/* Soft Dark Overlay */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(39,39,42,0.45),transparent_55%)]" />
//       </div>

//       {/* =========================================================
//           HERO SECTION
//       ========================================================== */}
//       <section className="relative z-10">
//         <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-24">
//           <div className="grid items-center gap-16 lg:grid-cols-2">

//             {/* =====================================================
//                 LEFT SIDE
//             ====================================================== */}
//             <div className="space-y-8">
//               {/* Badge */}
//               <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-400 shadow-sm backdrop-blur-md">
//                 <span className="relative flex h-2.5 w-2.5">
//                   <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
//                   <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
//                 </span>

//                 Innovation • Technology • Growth
//               </div>

//               {/* Heading */}
//               <div>
//                 <h1 className="text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
//                   DriWE Smartech
//                   <br />

//                   <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
//                     Pvt. Ltd.
//                   </span>
//                 </h1>
//               </div>

//               {/* Main Description */}
//               <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
//                 DriWE Smartech Pvt. Ltd. brings technology, innovation, and
//                 business together to create smarter digital solutions for a
//                 rapidly evolving world.
//               </p>

//               <p className="max-w-xl text-base leading-7 text-zinc-500">
//                 We focus on simplifying business operations, strengthening
//                 customer relationships, and building technology that helps
//                 organizations work smarter, move faster, and grow with
//                 confidence.
//               </p>

//               {/* Buttons */}
//               <div className="flex flex-wrap gap-4 pt-2">
//                 <Link
//                   href="/dashboard"
//                   className="group flex items-center gap-3 rounded-2xl bg-yellow-400 px-7 py-4 text-base font-semibold text-zinc-950 shadow-xl shadow-yellow-500/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 active:scale-95"
//                 >
//                   Go to Dashboard

//                   <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
//                 </Link>

//                 <Link
//                   href="/companies"
//                   className="rounded-2xl border border-zinc-700 bg-zinc-900/70 px-7 py-4 text-base font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-zinc-800 active:scale-95"
//                 >
//                   Explore Companies
//                 </Link>
//               </div>

//               {/* Small Brand Statement */}
//               <div className="flex items-center gap-4 pt-4">
//                 <div className="h-px w-12 bg-yellow-400" />

//                 <p className="text-sm font-medium tracking-wide text-zinc-500">
//                   Building smarter solutions for a better digital future.
//                 </p>
//               </div>
//             </div>

//             {/* =====================================================
//                 RIGHT SIDE
//             ====================================================== */}
//             <div className="relative">
//               {/* Glow */}
//               <div className="absolute -inset-8 rounded-[3rem] bg-yellow-400/10 blur-3xl" />

//               <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">

//                 {/* Decorative Glow */}
//                 <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

//                 <div className="relative">

//                   {/* Section Label */}
//                   <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
//                     DriWE Smartech
//                   </p>

//                   {/* Heading */}
//                   <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
//                     Technology that moves
//                     <span className="text-yellow-400">
//                       {" "}
//                       businesses forward.
//                     </span>
//                   </h2>

//                   {/* Description */}
//                   <p className="mt-5 leading-7 text-zinc-400">
//                     At DriWE, we believe technology should make business
//                     simpler, smarter, and more connected. Our approach combines
//                     innovation with practical solutions that create real value
//                     for businesses and their customers.
//                   </p>

//                   {/* Feature 1 */}
//                   <div className="mt-8 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5">
//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
//                       <Lightbulb className="h-6 w-6 text-yellow-400" />
//                     </div>

//                     <div>
//                       <h3 className="font-semibold text-white">
//                         Smart Innovation
//                       </h3>

//                       <p className="mt-1 text-sm text-zinc-500">
//                         Turning ideas into meaningful digital solutions.
//                       </p>
//                     </div>
//                   </div>

//                   {/* Feature 2 */}
//                   <div className="mt-4 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5">
//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
//                       <Zap className="h-6 w-6 text-yellow-400" />
//                     </div>

//                     <div>
//                       <h3 className="font-semibold text-white">
//                         Built for Growth
//                       </h3>

//                       <p className="mt-1 text-sm text-zinc-500">
//                         Technology designed for efficiency and scale.
//                       </p>
//                     </div>
//                   </div>

//                   {/* Bottom */}
//                   <div className="mt-8 border-t border-zinc-800 pt-6">
//                     <p className="text-sm font-semibold text-zinc-300">
//                       DriWE Smartech Pvt. Ltd.
//                     </p>

//                     <p className="mt-1 text-xs font-medium tracking-[0.2em] text-yellow-400">
//                       INNOVATE • CONNECT • GROW
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Decorative Circles */}
//               <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

//               <div className="absolute -right-10 top-1/3 h-32 w-32 rounded-full bg-yellow-300/10 blur-3xl" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =========================================================
//           WHY DRIWE
//       ========================================================== */}
//       <section className="relative z-10 border-t border-zinc-800/70 bg-zinc-950/60 backdrop-blur-sm">
//         <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">

//           {/* Section Heading */}
//           <div className="mx-auto max-w-2xl text-center">
//             <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
//               Why DriWE
//             </p>

//             <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
//               Smarter technology. Better possibilities.
//             </h2>

//             <p className="mt-4 leading-7 text-zinc-500">
//               We bring together technology, people, and processes to help
//               businesses create better experiences and achieve sustainable
//               growth.
//             </p>
//           </div>

//           {/* Cards */}
//           <div className="mt-12 grid gap-6 md:grid-cols-3">

//             {/* Card 1 */}
//             <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/5">
//               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10">
//                 <Building2 className="h-7 w-7 text-yellow-400" />
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-white">
//                 Business Focused
//               </h3>

//               <p className="mt-3 leading-7 text-zinc-500">
//                 Solutions designed around real business needs, challenges,
//                 customers, and opportunities.
//               </p>
//             </div>

//             {/* Card 2 */}
//             <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/5">
//               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10">
//                 <Target className="h-7 w-7 text-yellow-400" />
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-white">
//                 Purpose Driven
//               </h3>

//               <p className="mt-3 leading-7 text-zinc-500">
//                 We focus on creating technology that solves problems and
//                 delivers measurable value.
//               </p>
//             </div>

//             {/* Card 3 */}
//             <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/5">
//               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10">
//                 <ShieldCheck className="h-7 w-7 text-yellow-400" />
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-white">
//                 Built with Trust
//               </h3>

//               <p className="mt-3 leading-7 text-zinc-500">
//                 Reliable systems and thoughtful experiences built to support
//                 long-term business relationships.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =========================================================
//           CTA
//       ========================================================== */}
//       <section className="relative z-10 px-6 py-20">
//         <div className="mx-auto max-w-7xl">
//           <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 px-8 py-14 text-center shadow-2xl shadow-black/40 sm:px-12">

//             {/* Yellow Glow */}
//             <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

//             <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />

//             <div className="relative">
//               <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
//                 DriWE Smartech Pvt. Ltd.
//               </p>

//               <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
//                 Let technology become your competitive advantage.
//               </h2>

//               <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-400">
//                 Explore the DriWE ecosystem and discover a smarter way to
//                 manage your business, customers, and everyday operations.
//               </p>

//               <div className="mt-8 flex flex-wrap justify-center gap-4">
//                 <Link
//                   href="/dashboard"
//                   className="group flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
//                 >
//                   Open DriWE CRM

//                   <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
//                 </Link>

//                 <Link
//                   href="/companies"
//                   className="rounded-xl border border-zinc-700 px-6 py-3.5 font-semibold text-white transition hover:border-yellow-400/50 hover:bg-white/5"
//                 >
//                   View Companies
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Lightbulb,
  Zap,
  Target,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main Yellow Glow */}
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-yellow-400/10 blur-[130px]" />

        {/* Right Yellow Glow */}
        <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-yellow-300/10 blur-[150px]" />

        {/* Bottom Yellow Glow */}
        <div className="absolute bottom-[-250px] left-1/4 h-[600px] w-[600px] rounded-full bg-yellow-400/5 blur-[140px]" />

        {/* Soft Dark Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(39,39,42,0.45),transparent_55%)]" />
      </div>

      {/* =========================================================
          HERO SECTION
      ========================================================== */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* =====================================================
                LEFT SIDE
            ====================================================== */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-400 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
                </span>

                Innovation • Technology • Growth
              </div>

              {/* Heading */}
              <div>
                <h1 className="text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                  DriWE Smartech
                  <br />

                  <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    Pvt. Ltd.
                  </span>
                </h1>
              </div>

              {/* Main Description */}
              <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                DriWE Smartech Pvt. Ltd. brings technology, innovation, and
                business together to create smarter digital solutions for a
                rapidly evolving world.
              </p>

              {/* Secondary Description */}
              <p className="max-w-xl text-base leading-7 text-zinc-500">
                We focus on simplifying business operations, strengthening
                customer relationships, and building technology that helps
                organizations work smarter, move faster, and grow with
                confidence.
              </p>

              {/* =====================================================
                  ACTION BUTTONS
              ====================================================== */}
              <div className="flex flex-wrap gap-4 pt-2">
                {/* Login / Dashboard */}
                <Link
                  href="/login"
                  className="group flex items-center gap-3 rounded-2xl bg-yellow-400 px-7 py-4 text-base font-semibold text-zinc-950 shadow-xl shadow-yellow-500/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 active:scale-95"
                >
                  Go to Dashboard

                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Login / Companies */}
                <Link
                  href="/login"
                  className="rounded-2xl border border-zinc-700 bg-zinc-900/70 px-7 py-4 text-base font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-zinc-800 active:scale-95"
                >
                  Explore Companies
                </Link>
              </div>

              {/* Small Brand Statement */}
              <div className="flex items-center gap-4 pt-4">
                <div className="h-px w-12 bg-yellow-400" />

                <p className="text-sm font-medium tracking-wide text-zinc-500">
                  Building smarter solutions for a better digital future.
                </p>
              </div>
            </div>

            {/* =====================================================
                RIGHT SIDE
            ====================================================== */}
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-8 rounded-[3rem] bg-yellow-400/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">
                {/* Decorative Glow */}
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

                <div className="relative">
                  {/* Section Label */}
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                    DriWE Smartech
                  </p>

                  {/* Heading */}
                  <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Technology that moves
                    <span className="text-yellow-400">
                      {" "}
                      businesses forward.
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="mt-5 leading-7 text-zinc-400">
                    At DriWE, we believe technology should make business
                    simpler, smarter, and more connected. Our approach combines
                    innovation with practical solutions that create real value
                    for businesses and their customers.
                  </p>

                  {/* Feature 1 */}
                  <div className="mt-8 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                      <Lightbulb className="h-6 w-6 text-yellow-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        Smart Innovation
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        Turning ideas into meaningful digital solutions.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="mt-4 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                      <Zap className="h-6 w-6 text-yellow-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        Built for Growth
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        Technology designed for efficiency and scale.
                      </p>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-8 border-t border-zinc-800 pt-6">
                    <p className="text-sm font-semibold text-zinc-300">
                      DriWE Smartech Pvt. Ltd.
                    </p>

                    <p className="mt-1 text-xs font-medium tracking-[0.2em] text-yellow-400">
                      INNOVATE • CONNECT • GROW
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Circles */}
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

              <div className="absolute -right-10 top-1/3 h-32 w-32 rounded-full bg-yellow-300/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY DRIWE
      ========================================================== */}
      <section className="relative z-10 border-t border-zinc-800/70 bg-zinc-950/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
          {/* Section Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Why DriWE
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Smarter technology. Better possibilities.
            </h2>

            <p className="mt-4 leading-7 text-zinc-500">
              We bring together technology, people, and processes to help
              businesses create better experiences and achieve sustainable
              growth.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10">
                <Building2 className="h-7 w-7 text-yellow-400" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Business Focused
              </h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Solutions designed around real business needs, challenges,
                customers, and opportunities.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10">
                <Target className="h-7 w-7 text-yellow-400" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Purpose Driven
              </h3>

              <p className="mt-3 leading-7 text-zinc-500">
                We focus on creating technology that solves problems and
                delivers measurable value.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10">
                <ShieldCheck className="h-7 w-7 text-yellow-400" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Built with Trust
              </h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Reliable systems and thoughtful experiences built to support
                long-term business relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 px-8 py-14 text-center shadow-2xl shadow-black/40 sm:px-12">
            {/* Yellow Glow */}
            <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
                DriWE Smartech Pvt. Ltd.
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Let technology become your competitive advantage.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-400">
                Explore the DriWE ecosystem and discover a smarter way to
                manage your business, customers, and everyday operations.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {/* Open CRM */}
                <Link
                  href="/login"
                  className="group flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                >
                  Open DriWE CRM

                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Companies */}
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-700 px-6 py-3.5 font-semibold text-white transition hover:border-yellow-400/50 hover:bg-white/5"
                >
                  View Companies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}