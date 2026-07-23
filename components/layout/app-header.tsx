"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Search,
  UserCircle2,
  ChevronDown,
} from "lucide-react";

interface Notification {
  notificationId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Profile {
  name: string;
  email: string;
  mobile: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  dob: string;
  address: string;
  city: string;
  pincode: string;
}

export default function AppHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    loadProfile();

    const timer = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
      });

      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  }

  const unread = notifications.filter(
    (n) => !n.isRead
  ).length;
  return (
    <header className="sticky top-0 z-[100] border-b border-slate-800/70 bg-zinc-950/80 backdrop-blur-xl">
      <div className="relative z-[100] flex h-16 items-center justify-between px-6">

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            type="text"
            placeholder="Search employees, companies, tasks..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-500"
          />
        </div>

        <div className="ml-6 flex items-center gap-4">

          {/* Notifications */}
          <div
            className="relative z-[9999]"
            ref={notificationRef}
          >

            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-3 hover:border-cyan-500"
            >
              <Bell className="text-slate-300" size={19} />

              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            {notificationOpen && (
             <div
  className="
    absolute
    right-0
    top-full
    mt-3
    w-96
    rounded-2xl
    border
    border-slate-800
    bg-slate-950
    p-6
    shadow-2xl
    z-[9999]
  "
>

                <div className="border-b border-slate-800 p-4">
                  <h3 className="font-semibold text-white">
                    Notifications
                  </h3>
                </div>

                <div className="max-h-96 overflow-y-auto">

                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.notificationId}
                        onClick={() => markAsRead(item.notificationId)}
                        className={`w-full border-b border-slate-800 p-4 text-left hover:bg-slate-900 ${!item.isRead ? "bg-cyan-500/5" : ""
                          }`}
                      >
                        <div className="font-medium text-white">
                          {item.title}
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 hover:border-cyan-500"
            >
              <UserCircle2
                size={34}
                className="text-cyan-400"
              />

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-white">
                  {profile?.name || "Loading..."}
                </p>

                <p className="text-xs text-slate-400">
                  {profile?.role}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="text-slate-500"
              />
            </button>

            {profileOpen && profile && (
              <div
                className="
    absolute
    right-0
    top-full
    mt-3
    w-96
    rounded-2xl
    border
    border-slate-800
    bg-slate-950
    p-6
    shadow-2xl
    z-50
  "
              >

                <h2 className="mb-5 text-xl font-bold text-white">
                  My Profile
                </h2>

                <div className="space-y-3 text-sm">

                  <div>
                    <span className="text-slate-500">Name</span>
                    <p className="text-white">{profile.name}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Email</span>
                    <p className="text-white">{profile.email}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Mobile</span>
                    <p className="text-white">{profile.mobile || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Designation</span>
                    <p className="text-white">{profile.designation || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Department</span>
                    <p className="text-white">{profile.department || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Role</span>
                    <p className="text-white">{profile.role}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Status</span>
                    <p className="text-white">{profile.status}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">DOB</span>
                    <p className="text-white">{profile.dob || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Address</span>
                    <p className="text-white">{profile.address || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">City</span>
                    <p className="text-white">{profile.city || "-"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500">Pincode</span>
                    <p className="text-white">{profile.pincode || "-"}</p>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}