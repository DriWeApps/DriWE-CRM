"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Save,
  Mail,
  CalendarDays,
  ClipboardList,
  PhoneCall,
} from "lucide-react";

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskNotifications: true,
    meetingReminders: true,
    followupReminders: true,
    systemNotifications: true,
    weeklyReport: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/notifications");
      const data = await res.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleChange(name: string) {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  }

  async function handleSave() {
    setLoading(true);

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        alert("Notification settings updated successfully.");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const items = [
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive important CRM notifications by email.",
      icon: <Mail size={22} className="text-cyan-400" />,
    },
    {
      key: "taskNotifications",
      title: "Task Notifications",
      description: "Get notified whenever a task is assigned or updated.",
      icon: <ClipboardList size={22} className="text-green-400" />,
    },
    {
      key: "meetingReminders",
      title: "Meeting Reminders",
      description: "Receive reminders before scheduled meetings.",
      icon: <CalendarDays size={22} className="text-purple-400" />,
    },
    {
      key: "followupReminders",
      title: "Follow-up Reminders",
      description: "Receive reminders for upcoming follow-ups.",
      icon: <PhoneCall size={22} className="text-yellow-400" />,
    },
    {
      key: "systemNotifications",
      title: "System Notifications",
      description: "Receive important CRM system updates.",
      icon: <Bell size={22} className="text-pink-400" />,
    },
    {
      key: "weeklyReport",
      title: "Weekly Performance Report",
      description: "Receive your weekly performance report every Monday.",
      icon: <Mail size={22} className="text-orange-400" />,
    },
  ];

  return (
    <div className="w-full p-6">

      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <Link
          href="/settings"
          className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800"
        >
          <ArrowLeft className="text-white" size={18} />
        </Link>

        <div>

          <div className="flex items-center gap-3">

            <Bell className="text-cyan-400" size={30} />

            <h1 className="text-3xl font-bold text-white">
              Notification Settings
            </h1>

          </div>

          <p className="mt-2 text-slate-400">
            Choose which notifications you want to receive.
          </p>

        </div>

      </div>

      {/* Notification Cards */}

      <div className="space-y-5">

        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-5"
          >
            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-slate-900 p-3">
                {item.icon}
              </div>

              <div>

                <h2 className="font-semibold text-white">
                  {item.title}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {item.description}
                </p>

              </div>

            </div>

            <label className="relative inline-flex cursor-pointer items-center">

              <input
                type="checkbox"
                checked={settings[item.key as keyof typeof settings]}
                onChange={() => handleChange(item.key)}
                className="peer sr-only"
              />

              <div className="peer h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-cyan-500"></div>

              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>

            </label>

          </div>
        ))}

      </div>

      {/* Save Button */}

      <div className="mt-8">

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          <Save size={18} />

          {loading ? "Saving..." : "Save Settings"}

        </button>

      </div>

    </div>
  );
}