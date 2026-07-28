"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Meeting {
  meetingId: string;
  title: string;

  companyId: string;
  companyName: string;

  meetingLink?: string;
  agenda?: string;
  description?: string;

  date: string;
  time: string;
  status: string;

  decision?: string;
  actionTaken?: string;

  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;

  participants?: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    joined?: boolean;
    joinedAt?: string;
  }[];
}

export default function EditMeetingPage() {
  const params = useParams();
  const router = useRouter();

  const meetingId = params.meetingId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    companyId: "",
    companyName: "",
    meetingLink: "",
    agenda: "",
    description: "",
    date: "",
    time: "",
    status: "Scheduled",
    decision: "",
    actionTaken: "",
  });

  useEffect(() => {
    if (!meetingId) return;

    async function loadMeeting() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          alert(data.message || "Failed to load meeting");
          router.push("/meetings");
          return;
        }

        const meeting: Meeting = data.meeting;

        setForm({
          title: meeting.title || "",
          companyId: meeting.companyId || "",
          companyName: meeting.companyName || "",
          meetingLink: meeting.meetingLink || "",
          agenda: meeting.agenda || "",
          description: meeting.description || "",
          date: meeting.date || "",
          time: meeting.time || "",
          status: meeting.status || "Scheduled",
          decision: meeting.decision || "",
          actionTaken: meeting.actionTaken || "",
        });
      } catch (error) {
        console.error("Failed to load meeting:", error);
        alert("Failed to load meeting");
      } finally {
        setLoading(false);
      }
    }

    loadMeeting();
  }, [meetingId, router]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to update meeting");
        return;
      }

      alert("Meeting updated successfully");

      router.push(`/meetings/${meetingId}`);
      router.refresh();
    } catch (error) {
      console.error("Update meeting error:", error);
      alert("Failed to update meeting");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-400">
        Loading meeting...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/meetings/${meetingId}`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Meeting
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Edit Meeting
          </h1>

          <p className="mt-1 text-slate-400">
            Update meeting details
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Meeting Title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Company */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Company
          </label>

          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Date + Time */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Time
            </label>

            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Meeting Link */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Meeting Link
          </label>

          <input
            type="url"
            name="meetingLink"
            value={form.meetingLink}
            onChange={handleChange}
            placeholder="https://meet.google.com/..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Agenda */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Agenda
          </label>

          <textarea
            name="agenda"
            value={form.agenda}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Decision */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Decision
          </label>

          <textarea
            name="decision"
            value={form.decision}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Action Taken */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Action Taken
          </label>

          <textarea
            name="actionTaken"
            value={form.actionTaken}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">
          <Link
            href={`/meetings/${meetingId}`}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}