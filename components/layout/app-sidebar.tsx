// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { sidebarItems } from "@/constants/sidebar";
// import { SidebarItem } from "@/types/navigation";
// import { cn } from "@/lib/utils";

// export default function AppSidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/95 md:flex">
//       <div className="flex h-16 items-center border-b border-slate-800 px-6">
//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-bold text-slate-950">
//           D
//         </div>

//         <div className="ml-3">
//           <h1 className="text-lg font-bold text-white">DriWE CRM</h1>
//           <p className="text-xs text-slate-400">Company Management</p>
//         </div>
//       </div>

//       <nav className="flex-1 px-3 py-5">
//         <ul className="space-y-2">
//           {sidebarItems.map((item: SidebarItem) => {
//             const Icon = item.icon;
//             const active = pathname === item.href;

//             return (
//               <li key={item.title}>
//                 <Link
//                   href={item.href}
//                   className={cn(
//                     "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
//                     active
//                       ? "bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/10"
//                       : "text-slate-300 hover:bg-slate-800 hover:text-white"
//                   )}
//                 >
//                   <Icon size={18} />
//                   {item.title}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       <div className="border-t border-slate-800 p-4">
//         <p className="text-xs text-slate-500">© {new Date().getFullYear()} DriWE CRM</p>
//       </div>
//     </aside>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sidebarItems } from "@/constants/sidebar";
import { SidebarItem } from "@/types/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-slate-800 bg-slate-950 transition-all duration-300 md:flex md:flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}

      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-bold text-black shadow-lg shadow-cyan-500/30 transition-transform duration-300 hover:rotate-6 hover:scale-110">
            D
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">
                DriWE CRM
              </h1>

              <p className="text-xs text-slate-400">
                Company Management
              </p>
            </div>
          )}

        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">

        {sidebarItems.map((item: SidebarItem) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-2xl px-4 py-3 transition-all duration-300",
                active
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-lg shadow-cyan-500/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"
              )}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-cyan-400" />
              )}

              <Icon
                size={20}
                className="transition duration-300 group-hover:scale-125"
              />

              {!collapsed && (
                <span className="ml-4 font-medium">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-4">

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 transition-all duration-300 hover:scale-[1.02] hover:bg-red-500 hover:text-white disabled:opacity-60"
        >
          <LogOut
            size={18}
            className="transition group-hover:rotate-12"
          />

          {!collapsed && (
            <span>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          )}
        </button>

        {!collapsed && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
            <p className="text-xs text-slate-500">
              DriWE CRM
            </p>

            <p className="mt-1 text-xs text-slate-600">
              © {new Date().getFullYear()}
            </p>
          </div>
        )}

      </div>

    </aside>
  );
}