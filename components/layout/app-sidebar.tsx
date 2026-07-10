"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarItems } from "@/constants/sidebar";
import { SidebarItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
          D
        </div>

        <div className="ml-3">
          <h1 className="text-lg font-bold">DriWE CRM</h1>
          <p className="text-xs text-gray-500">Company Management</p>
        </div>
      </div>

      {/* Navigation */}
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
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  )}
                >
                  <Icon size={20} />

                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} DriWE CRM
        </p>
      </div>
    </aside>
  );
}