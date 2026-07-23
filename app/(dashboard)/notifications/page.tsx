"use client";

import { useEffect, useState } from "react";


interface Employee {
    employeeId: string;
    name: string;
    email: string;
    role: string;
}

export default function NotificationsPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [sentNotifications, setSentNotifications] = useState<any[]>([]);
    const [replies, setReplies] = useState<Record<string, any[]>>({});
    const [replyMessage, setReplyMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [sendingReply, setSendingReply] = useState(false);

    const [me, setMe] = useState<any>(null);
    useEffect(() => {
        console.log("Current User:", me);
    }, [me]);

    useEffect(() => {
        loadEmployees();
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (me?.role?.toLowerCase() === "admin") {
            const interval = setInterval(() => {
                loadSentNotifications();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [me]);

    async function loadCurrentUser() {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated) {
            setMe(data.user);

            if (data.user.role?.toLowerCase() === "admin") {
                loadSentNotifications();
            } else {
                loadNotifications();
            }
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

    async function loadNotifications() {
        try {
            setLoadingNotifications(true);

            const res = await fetch("/api/notifications");
            const data = await res.json();

            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingNotifications(false);
        }
    }

    async function loadSentNotifications() {
        try {
            const res = await fetch("/api/notifications/sent");
            const data = await res.json();

            if (data.success) {
                // setSentNotifications(data.notifications || []);
                const notifications = data.notifications || [];

                setSentNotifications(notifications);

                for (const notification of notifications) {
                    await loadReplies(notification.notificationId);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function loadReplies(notificationId: string) {
        try {
            const res = await fetch(
                `/api/notifications/reply/${notificationId}`
            );

            const data = await res.json();

            if (data.success) {
                setReplies((prev) => ({
                    ...prev,
                    [notificationId]: data.replies,
                }));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function sendReply(notification: any) {
        if (!replyMessage.trim()) {
            alert("Please enter a reply.");
            return;
        }

        try {
            setSendingReply(true);

            const res = await fetch("/api/notifications/reply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notificationId: notification.notificationId,
                    receiverEmail: notification.sentByEmail,
                    message: replyMessage,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            alert("Reply sent successfully.");

            setReplyMessage("");
            setReplyingTo(null);

        } catch (error) {
            console.error(error);
            alert("Unable to send reply.");
        } finally {
            setSendingReply(false);
        }
    }
    async function sendNotification() {
        if (recipientEmails.length === 0 || !title || !message) {
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
                    recipientEmails,
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

            setRecipientEmails([]);
            setTitle("");
            setMessage("");
            loadEmployees();
            loadSentNotifications();

        } catch (error) {
            console.error(error);
            alert("Unable to send notification.");
        } finally {
            setSending(false);
        }
    }

    if (!me) {
        return (
            <div className="p-8 text-white">
                Loading...
            </div>
        );
    }

    if (!me) {
        return (
            <div className="p-8 text-white">
                Loading...
            </div>
        );
    }

    if (me.role.toLowerCase() !== "admin") {
        return (
            <div className="mx-auto max-w-4xl space-y-6">

                <div>
                    <h1 className="text-3xl font-bold text-white">
                        My Notifications
                    </h1>

                    <p className="text-slate-400">
                        Notifications sent to you.
                    </p>
                </div>

                {loadingNotifications ? (
                    <div className="text-slate-400">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
                        No notifications found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification: any) => (
                            <div
                                key={notification.notificationId}
                                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                            >
                                <h2 className="text-lg font-semibold text-white">
                                    {notification.title}
                                </h2>

                                <p className="mt-2 text-slate-300">
                                    {notification.message}
                                </p>

                                <p className="mt-4 text-xs text-slate-500">
                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}
                                </p>

                                <div className="mt-4">

                                    {replyingTo === notification.notificationId ? (
                                        <>
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) =>
                                                    setReplyMessage(e.target.value)
                                                }
                                                rows={3}
                                                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
                                                placeholder="Write your reply..."
                                            />

                                            <div className="mt-3 flex gap-3">

                                                <button
                                                    onClick={() => sendReply(notification)}
                                                    disabled={sendingReply}
                                                    className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black"
                                                >
                                                    {sendingReply
                                                        ? "Sending..."
                                                        : "Send Reply"}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyMessage("");
                                                    }}
                                                    className="rounded-lg border border-slate-700 px-4 py-2 text-white"
                                                >
                                                    Cancel
                                                </button>

                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setReplyingTo(
                                                    notification.notificationId
                                                )
                                            }
                                            className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black"
                                        >
                                            Reply
                                        </button>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

                    <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-3">
                        {employees.map((employee) => (
                            <label
                                key={employee.employeeId}
                                className="flex items-center gap-3 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={recipientEmails.includes(employee.email)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setRecipientEmails((prev) => [
                                                ...prev,
                                                employee.email,
                                            ]);
                                        } else {
                                            setRecipientEmails((prev) =>
                                                prev.filter(
                                                    (email) => email !== employee.email
                                                )
                                            );
                                        }
                                    }}
                                />

                                <span className="text-white">
                                    {employee.name} ({employee.role})
                                </span>

                                <span className="text-slate-400 text-sm">
                                    {employee.email}
                                </span>
                            </label>
                        ))}
                    </div>
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

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mt-6">

                <h2 className="text-xl font-bold text-white mb-4">
                    Sent Notifications
                </h2>

                {sentNotifications.length === 0 ? (
                    <p className="text-slate-400">
                        No notifications sent yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {sentNotifications.map((notification: any) => (
                            <div
                                key={notification.notificationId}
                                className="rounded-xl border border-slate-700 p-4"
                            >
                                <h3 className="text-lg font-semibold text-white">
                                    {notification.title}
                                </h3>

                                <p className="mt-2 text-slate-300">
                                    {notification.message}
                                </p>

                                <p className="mt-2 text-sm text-slate-400">
                                    To: {notification.recipientEmail}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>

                                <div className="mt-4 border-t border-slate-700 pt-3">

                                    <h4 className="font-semibold text-white mb-2">
                                        Replies
                                    </h4>

                                    {replies[notification.notificationId]?.length ? (
                                        replies[notification.notificationId].map(
                                            (reply: any) => (
                                                <div
                                                    key={reply.replyId}
                                                    className="mb-3 rounded-lg bg-slate-800 p-3"
                                                >
                                                    <p className="text-cyan-400 text-sm font-semibold">
                                                        {reply.senderEmail}
                                                    </p>

                                                    <p className="text-white mt-1">
                                                        {reply.message}
                                                    </p>

                                                    <p className="text-xs text-slate-500 mt-2">
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <p className="text-slate-500 text-sm">
                                            No replies yet.
                                        </p>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}