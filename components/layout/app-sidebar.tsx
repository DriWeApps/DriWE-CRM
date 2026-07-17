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
import { LogOut } from "lucide-react";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/95 md:flex">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-bold text-slate-950">
          D
        </div>

        <div className="ml-3">
          <h1 className="text-lg font-bold text-white">DriWE CRM</h1>
          <p className="text-xs text-slate-400">Company Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5">
        <ul className="space-y-2">
          {sidebarItems.map((item: SidebarItem) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/10"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-800 p-4 space-y-3">

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Logout
        </button>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} DriWE CRM
        </p>

      </div>
    </aside>
  );
}