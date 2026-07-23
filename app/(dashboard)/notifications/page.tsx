"use client";

import { useEffect, useState } from "react";


interface Employee {
    employeeId: string;
    name: string;
    email: string;
    role: string;
}


// interface Employee {
//   employeeId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// }


export default function NotificationsPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const [me, setMe] = useState<any>(null);

    useEffect(() => {
        loadEmployees();
        loadCurrentUser();
    }, []);

    async function loadCurrentUser() {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.success) {
            setMe(data.user);
        }
    }
    useEffect(() => {
        loadEmployees();
    }, []);

    async function loadEmployees() {
        const res = await fetch("/api/employees");
        const data = await res.json();

        setEmployees(Array.isArray(data) ? data : data.employees || []);
    }

    async function sendNotification() {
        if (!recipientEmail || !title || !message) {
            alert("Please fill all fields.");
            return;
        }

        try {
            setSending(true);

            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipientEmail,
                    title,
                    message,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            alert("Notification sent successfully.");

            setRecipientEmail("");
            setTitle("");
            setMessage("");
            loadEmployees();

        } catch (error) {
            console.error(error);
            alert("Unable to send notification.");
        } finally {
            setSending(false);
        }
    }
    if (me && me.role !== "ADMIN") {
        return (
            <div className="p-10 text-center text-red-400">
                You are not authorized to access this page.
            </div>
        );
    }
    return (
        <div className="mx-auto max-w-3xl space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-white">
                    Send Notification
                </h1>

                <p className="text-slate-400">
                    Send a notification to an employee.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">

                <div>
                    <label className="mb-2 block text-sm text-slate-300">
                        Employee
                    </label>

                    <select
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    >
                        <option value="">
                            Select Employee
                        </option>

                        {employees.map((employee) => (
                            <option
                                key={employee.employeeId}
                                value={employee.email}
                            >
                                {employee.name} ({employee.role}) - {employee.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300">
                        Title
                    </label>

                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        placeholder="Notification title"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300">
                        Message
                    </label>

                    <textarea
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        placeholder="Write notification..."
                    />
                </div>

                <button
                    onClick={sendNotification}
                    disabled={sending}
                    className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
                >
                    {sending ? "Sending..." : "Send Notification"}
                </button>

            </div>

        </div>
    );
}