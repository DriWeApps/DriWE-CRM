import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  CalendarDays,
  PhoneCall,
  BarChart3,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Meetings",
    href: "/meetings",
    icon: CalendarDays,
  },
  {
    title: "Follow Ups",
    href: "/followups",
    icon: PhoneCall,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];