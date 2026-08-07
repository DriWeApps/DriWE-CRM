// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// interface Employee {
//     employeeId: string;
//     name: string;
//     email: string;
//     role: string;
// }


// export default function NotificationsPage() {
//     const [employees, setEmployees] = useState<Employee[]>([]);
//     const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
//     const [title, setTitle] = useState("");
//     const [message, setMessage] = useState("");
//     const [sending, setSending] = useState(false);
//     const [notifications, setNotifications] = useState<any[]>([]);
//     const [loadingNotifications, setLoadingNotifications] = useState(false);
//     const [sentNotifications, setSentNotifications] = useState<any[]>([]);
//     const [replies, setReplies] = useState<Record<string, any[]>>({});
//     const [replyMessage, setReplyMessage] = useState("");
//     const [replyingTo, setReplyingTo] = useState<string | null>(null);
//     const [sendingReply, setSendingReply] = useState(false);
//     const router = useRouter();

//     const [me, setMe] = useState<any>(null);
//     useEffect(() => {
//         console.log("Current User:", me);
//     }, [me]);

//     useEffect(() => {
//         loadEmployees();
//         loadCurrentUser();
//     }, []);

//     useEffect(() => {
//         if (me?.role?.toLowerCase() === "admin") {
//             const interval = setInterval(() => {
//                 loadSentNotifications();
//             }, 5000);

//             return () => clearInterval(interval);
//         }
//     }, [me]);

//     async function loadCurrentUser() {
//         const res = await fetch("/api/auth/me");
//         const data = await res.json();

//         if (data.authenticated) {
//             setMe(data.user);

//             if (data.user.role?.toLowerCase() === "admin") {
//                 loadSentNotifications();
//             } else {
//                 loadNotifications();
//             }
//         }
//     }


//     useEffect(() => {
//         loadEmployees();
//     }, []);

//     async function loadEmployees() {
//         const res = await fetch("/api/employees");
//         const data = await res.json();

//         setEmployees(Array.isArray(data) ? data : data.employees || []);
//     }

//     async function loadNotifications() {
//         try {
//             setLoadingNotifications(true);

//             const res = await fetch("/api/notifications");
//             const data = await res.json();

//             if (data.success) {
//                 setNotifications(data.notifications || []);
//             }
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoadingNotifications(false);
//         }
//     }

//     async function loadSentNotifications() {
//         try {
//             const res = await fetch("/api/notifications/sent");
//             const data = await res.json();

//             if (data.success) {
//                 // setSentNotifications(data.notifications || []);
//                 const notifications = data.notifications || [];

//                 setSentNotifications(notifications);

//                 for (const notification of notifications) {
//                     await loadReplies(notification.notificationId);
//                 }
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     }

//     async function loadReplies(notificationId: string) {
//         try {
//             const res = await fetch(
//                 `/api/notifications/reply/${notificationId}`
//             );

//             const data = await res.json();

//             if (data.success) {
//                 setReplies((prev) => ({
//                     ...prev,
//                     [notificationId]: data.replies,
//                 }));
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     }

//     async function sendReply(notification: any) {
//         if (!replyMessage.trim()) {
//             alert("Please enter a reply.");
//             return;
//         }

//         try {
//             setSendingReply(true);

//             const res = await fetch("/api/notifications/reply", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     notificationId: notification.notificationId,
//                     receiverEmail: notification.sentByEmail,
//                     message: replyMessage,
//                 }),
//             });

//             const data = await res.json();

//             if (!data.success) {
//                 alert(data.message);
//                 return;
//             }

//             alert("Reply sent successfully.");

//             setReplyMessage("");
//             setReplyingTo(null);

//         } catch (error) {
//             console.error(error);
//             alert("Unable to send reply.");
//         } finally {
//             setSendingReply(false);
//         }
//     }
//     async function sendNotification() {
//         if (recipientEmails.length === 0 || !title || !message) {
//             alert("Please fill all fields.");
//             return;
//         }

//         try {
//             setSending(true);

//             const res = await fetch("/api/notifications", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     recipientEmails,
//                     title,
//                     message,
//                 }),
//             });

//             const data = await res.json();

//             if (!data.success) {
//                 alert(data.message);
//                 return;
//             }

//             alert("Notification sent successfully.");

//             setRecipientEmails([]);
//             setTitle("");
//             setMessage("");
//             loadEmployees();
//             loadSentNotifications();

//         } catch (error) {
//             console.error(error);
//             alert("Unable to send notification.");
//         } finally {
//             setSending(false);
//         }
//     }

//     if (!me) {
//         return (
//             <div className="p-8 text-white">
//                 Loading...
//             </div>
//         );
//     }

//     if (!me) {
//         return (
//             <div className="p-8 text-white">
//                 Loading...
//             </div>
//         );
//     }

//     if (me.role.toLowerCase() !== "admin") {
//         return (
//             <div className="mx-auto max-w-4xl space-y-6">

//                 <div>
//                     <h1 className="text-3xl font-bold text-white">
//                         My Notifications
//                     </h1>

//                     <p className="text-slate-400">
//                         Notifications sent to you.
//                     </p>
//                 </div>

//                 {loadingNotifications ? (
//                     <div className="text-slate-400">
//                         Loading...
//                     </div>
//                 ) : notifications.length === 0 ? (
//                     <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
//                         No notifications found.
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                         {notifications.map((notification: any) => (
//                             <div
//                                 key={notification.notificationId}
//                                 onClick={async () => {
//                                     if (notification.meetingId) {

//                                         await fetch(
//                                             `/api/notifications/${notification.notificationId}/read`,
//                                             {
//                                                 method: "PUT",
//                                             }
//                                         );

//                                         router.push(`/meetings/${notification.meetingId}`);
//                                     }
//                                 }}
//                                 className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-cyan-500 hover:bg-slate-800 transition"
//                             >
//                                 <h2 className="text-lg font-semibold text-white">
//                                     {notification.title}
//                                 </h2>

//                                 <p className="mt-2 text-slate-300">
//                                     {notification.message}
//                                 </p>

//                                 <p className="mt-4 text-xs text-slate-500">
//                                     {new Date(
//                                         notification.createdAt
//                                     ).toLocaleString()}
//                                 </p>

//                                 <div className="mt-4">

//                                     {replyingTo === notification.notificationId ? (
//                                         <>
//                                             <textarea
//                                                 value={replyMessage}
//                                                 onChange={(e) =>
//                                                     setReplyMessage(e.target.value)
//                                                 }
//                                                 rows={3}
//                                                 className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
//                                                 placeholder="Write your reply..."
//                                             />

//                                             <div className="mt-3 flex gap-3">

//                                                 <button
//                                                     onClick={() => sendReply(notification)}
//                                                     disabled={sendingReply}
//                                                     className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black"
//                                                 >
//                                                     {sendingReply
//                                                         ? "Sending..."
//                                                         : "Send Reply"}
//                                                 </button>

//                                                 <button
//                                                     onClick={() => {
//                                                         setReplyingTo(null);
//                                                         setReplyMessage("");
//                                                     }}
//                                                     className="rounded-lg border border-slate-700 px-4 py-2 text-white"
//                                                 >
//                                                     Cancel
//                                                 </button>

//                                             </div>
//                                         </>
//                                     ) : (
//                                         <button
//                                             onClick={() =>
//                                                 setReplyingTo(
//                                                     notification.notificationId
//                                                 )
//                                             }
//                                             className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black"
//                                         >
//                                             Reply
//                                         </button>
//                                     )}

//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         );
//     }
//     return (
//         <div className="mx-auto max-w-3xl space-y-6">

//             <div>
//                 <h1 className="text-3xl font-bold text-white">
//                     Send Notification
//                 </h1>

//                 <p className="text-slate-400">
//                     Send a notification to an employee.
//                 </p>
//             </div>

//             <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">

//                 <div>
//                     <label className="mb-2 block text-sm text-slate-300">
//                         Employee
//                     </label>

//                     <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-3">
//                         {employees.map((employee) => (
//                             <label
//                                 key={employee.employeeId}
//                                 className="flex items-center gap-3 cursor-pointer"
//                             >
//                                 <input
//                                     type="checkbox"
//                                     checked={recipientEmails.includes(employee.email)}
//                                     onChange={(e) => {
//                                         if (e.target.checked) {
//                                             setRecipientEmails((prev) => [
//                                                 ...prev,
//                                                 employee.email,
//                                             ]);
//                                         } else {
//                                             setRecipientEmails((prev) =>
//                                                 prev.filter(
//                                                     (email) => email !== employee.email
//                                                 )
//                                             );
//                                         }
//                                     }}
//                                 />

//                                 <span className="text-white">
//                                     {employee.name} ({employee.role})
//                                 </span>

//                                 <span className="text-slate-400 text-sm">
//                                     {employee.email}
//                                 </span>
//                             </label>
//                         ))}
//                     </div>
//                 </div>

//                 <div>
//                     <label className="mb-2 block text-sm text-slate-300">
//                         Title
//                     </label>

//                     <input
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
//                         placeholder="Notification title"
//                     />
//                 </div>

//                 <div>
//                     <label className="mb-2 block text-sm text-slate-300">
//                         Message
//                     </label>

//                     <textarea
//                         rows={6}
//                         value={message}
//                         onChange={(e) => setMessage(e.target.value)}
//                         className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
//                         placeholder="Write notification..."
//                     />
//                 </div>

//                 <button
//                     onClick={sendNotification}
//                     disabled={sending}
//                     className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
//                 >
//                     {sending ? "Sending..." : "Send Notification"}
//                 </button>

//             </div>

//             <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mt-6">

//                 <h2 className="text-xl font-bold text-white mb-4">
//                     Sent Notifications
//                 </h2>

//                 {sentNotifications.length === 0 ? (
//                     <p className="text-slate-400">
//                         No notifications sent yet.
//                     </p>
//                 ) : (
//                     <div className="space-y-4">
//                         {sentNotifications.map((notification: any) => (
//                             <div
//                                 key={notification.notificationId}
//                                 className="rounded-xl border border-slate-700 p-4"
//                             >
//                                 <h3 className="text-lg font-semibold text-white">
//                                     {notification.title}
//                                 </h3>

//                                 <p className="mt-2 text-slate-300">
//                                     {notification.message}
//                                 </p>

//                                 <p className="mt-2 text-sm text-slate-400">
//                                     To: {notification.recipientEmail}
//                                 </p>

//                                 <p className="text-xs text-slate-500">
//                                     {new Date(notification.createdAt).toLocaleString()}
//                                 </p>

//                                 <div className="mt-4 border-t border-slate-700 pt-3">

//                                     <h4 className="font-semibold text-white mb-2">
//                                         Replies
//                                     </h4>

//                                     {replies[notification.notificationId]?.length ? (
//                                         replies[notification.notificationId].map(
//                                             (reply: any) => (
//                                                 <div
//                                                     key={reply.replyId}
//                                                     className="mb-3 rounded-lg bg-slate-800 p-3"
//                                                 >
//                                                     <p className="text-cyan-400 text-sm font-semibold">
//                                                         {reply.senderEmail}
//                                                     </p>

//                                                     <p className="text-white mt-1">
//                                                         {reply.message}
//                                                     </p>

//                                                     <p className="text-xs text-slate-500 mt-2">
//                                                         {new Date(reply.createdAt).toLocaleString()}
//                                                     </p>
//                                                 </div>
//                                             )
//                                         )
//                                     ) : (
//                                         <p className="text-slate-500 text-sm">
//                                             No replies yet.
//                                         </p>
//                                     )}

//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//         </div>
//     );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    /* =========================================================
       PAGE ACCESS
    ========================================================= */

    const [checkingAccess, setCheckingAccess] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [accessMessage, setAccessMessage] = useState("");

    const router = useRouter();

    /* =========================================================
       CHECK PAGE ACCESS
    ========================================================= */

    async function checkPageAccess() {
        try {
            const res = await fetch("/api/auth/me", {
                cache: "no-store",
                credentials: "include",
            });

            if (!res.ok) {
                setHasAccess(false);
                setAccessMessage(
                    "You don't have access to Notifications"
                );
                return;
            }

            const data = await res.json();

            if (!data.authenticated || !data.user) {
                setHasAccess(false);
                setAccessMessage(
                    "You don't have access to Notifications"
                );
                return;
            }

            const user = data.user;

            setMe(user);

            const role = user.role?.trim().toUpperCase();

            /*
             * Admin and Manager have full access
             */
            if (
                role === "ADMIN" ||
                role === "MANAGER"
            ) {
                setHasAccess(true);
                return;
            }

            /*
             * Get page access
             */
            const pageAccess =
                user.pageAccess ??
                user.allowedPages ??
                [];

            /*
             * Check Notifications permission
             */
            const allowed =
                Array.isArray(pageAccess) &&
                pageAccess.some(
                    (page: string) =>
                        typeof page === "string" &&
                        page.trim().toLowerCase() ===
                            "notifications"
                );

            if (!allowed) {
                setHasAccess(false);
                setAccessMessage(
                    "You don't have access to Notifications"
                );
                return;
            }

            setHasAccess(true);
        } catch (error) {
            console.error(
                "Notifications Permission Check Error:",
                error
            );

            setHasAccess(false);
            setAccessMessage(
                "You don't have access to Notifications"
            );
        } finally {
            setCheckingAccess(false);
        }
    }

    /* =========================================================
       LOAD CURRENT USER
    ========================================================= */

    async function loadCurrentUser() {
        try {
            const res = await fetch("/api/auth/me", {
                cache: "no-store",
                credentials: "include",
            });

            const data = await res.json();

            if (data.authenticated) {
                setMe(data.user);
            }
        } catch (error) {
            console.error(
                "Load Current User Error:",
                error
            );
        }
    }

    /* =========================================================
       LOAD EMPLOYEES
    ========================================================= */

    async function loadEmployees() {
        try {
            const res = await fetch("/api/employees", {
                cache: "no-store",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(
                    "Load Employees Error:",
                    data.message
                );
                return;
            }

            setEmployees(
                Array.isArray(data)
                    ? data
                    : data.employees || []
            );
        } catch (error) {
            console.error(
                "Load Employees Error:",
                error
            );
        }
    }

    /* =========================================================
       LOAD RECEIVED NOTIFICATIONS
    ========================================================= */

    async function loadNotifications() {
        try {
            setLoadingNotifications(true);

            const res = await fetch("/api/notifications", {
                cache: "no-store",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setNotifications(
                    data.notifications || []
                );
            }
        } catch (error) {
            console.error(
                "Load Notifications Error:",
                error
            );
        } finally {
            setLoadingNotifications(false);
        }
    }

    /* =========================================================
       LOAD SENT NOTIFICATIONS
    ========================================================= */

    async function loadSentNotifications() {
        try {
            const res = await fetch(
                "/api/notifications/sent",
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data.success) {
                const notificationList =
                    data.notifications || [];

                setSentNotifications(
                    notificationList
                );

                for (const notification of notificationList) {
                    await loadReplies(
                        notification.notificationId
                    );
                }
            }
        } catch (error) {
            console.error(
                "Load Sent Notifications Error:",
                error
            );
        }
    }

    /* =========================================================
       LOAD REPLIES
    ========================================================= */

    async function loadReplies(
        notificationId: string
    ) {
        try {
            const res = await fetch(
                `/api/notifications/reply/${notificationId}`,
                {
                    cache: "no-store",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data.success) {
                setReplies((prev) => ({
                    ...prev,
                    [notificationId]:
                        data.replies || [],
                }));
            }
        } catch (error) {
            console.error(
                "Load Replies Error:",
                error
            );
        }
    }

    /* =========================================================
       SEND REPLY
    ========================================================= */

    async function sendReply(notification: any) {
        if (!replyMessage.trim()) {
            alert("Please enter a reply.");
            return;
        }

        try {
            setSendingReply(true);

            const res = await fetch(
                "/api/notifications/reply",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        notificationId:
                            notification.notificationId,
                        receiverEmail:
                            notification.sentByEmail,
                        message: replyMessage,
                    }),
                }
            );

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

    /* =========================================================
       SEND NOTIFICATION
    ========================================================= */

    async function sendNotification() {
        if (
            recipientEmails.length === 0 ||
            !title.trim() ||
            !message.trim()
        ) {
            alert("Please fill all fields.");
            return;
        }

        try {
            setSending(true);

            const res = await fetch(
                "/api/notifications",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        recipientEmails,
                        title,
                        message,
                    }),
                }
            );

            const data = await res.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            alert(
                "Notification sent successfully."
            );

            setRecipientEmails([]);
            setTitle("");
            setMessage("");

            await loadEmployees();
            await loadSentNotifications();
        } catch (error) {
            console.error(error);
            alert("Unable to send notification.");
        } finally {
            setSending(false);
        }
    }

    /* =========================================================
       INITIAL ACCESS CHECK
    ========================================================= */

    useEffect(() => {
        checkPageAccess();
    }, []);

    /* =========================================================
       LOAD DATA ONLY AFTER ACCESS IS CONFIRMED
    ========================================================= */

    useEffect(() => {
        if (!checkingAccess && hasAccess) {
            loadCurrentUser();
            loadEmployees();
        }
    }, [checkingAccess, hasAccess]);

    /* =========================================================
       LOAD NOTIFICATIONS / SENT NOTIFICATIONS
    ========================================================= */

    useEffect(() => {
        if (
            !checkingAccess &&
            hasAccess &&
            me
        ) {
            if (
                me.role?.toLowerCase() ===
                "admin"
            ) {
                loadSentNotifications();
            } else {
                loadNotifications();
            }
        }
    }, [
        checkingAccess,
        hasAccess,
        me,
    ]);

    /* =========================================================
       ADMIN SENT NOTIFICATION REFRESH
    ========================================================= */

    useEffect(() => {
        if (
            hasAccess &&
            me?.role?.toLowerCase() ===
                "admin"
        ) {
            const interval =
                setInterval(() => {
                    loadSentNotifications();
                }, 5000);

            return () =>
                clearInterval(interval);
        }
    }, [me, hasAccess]);

    /* =========================================================
       ACCESS CHECKING SCREEN
    ========================================================= */

    if (checkingAccess) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center p-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-8 py-6 text-center">

                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                    <p className="text-slate-300">
                        Checking page access...
                    </p>

                </div>
            </div>
        );
    }

    /* =========================================================
       ACCESS DENIED
    ========================================================= */

    if (!hasAccess) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center p-6">

                <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-950 p-8 text-center shadow-xl">

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                        <svg
                            className="h-7 w-7 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white">
                        Access Denied
                    </h1>

                    <p className="mt-3 text-slate-400">
                        {accessMessage ||
                            "You don't have access to Notifications"}
                    </p>

                    <button
                        onClick={() =>
                            router.push("/dashboard")
                        }
                        className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
                    >
                        Go to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    /* =========================================================
       WAIT FOR USER
    ========================================================= */

    if (!me) {
        return (
            <div className="p-8 text-white">
                Loading...
            </div>
        );
    }

    /* =========================================================
       EMPLOYEE / NON-ADMIN NOTIFICATIONS
    ========================================================= */

    if (
        me.role?.toLowerCase() !==
        "admin"
    ) {
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

                        {notifications.map(
                            (notification: any) => (
                                <div
                                    key={
                                        notification.notificationId
                                    }
                                    onClick={async () => {
                                        if (
                                            notification.meetingId
                                        ) {
                                            await fetch(
                                                `/api/notifications/${notification.notificationId}/read`,
                                                {
                                                    method: "PUT",
                                                }
                                            );

                                            router.push(
                                                `/meetings/${notification.meetingId}`
                                            );
                                        }
                                    }}
                                    className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500 hover:bg-slate-800"
                                >

                                    <h2 className="text-lg font-semibold text-white">
                                        {
                                            notification.title
                                        }
                                    </h2>

                                    <p className="mt-2 text-slate-300">
                                        {
                                            notification.message
                                        }
                                    </p>

                                    <p className="mt-4 text-xs text-slate-500">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    <div className="mt-4">

                                        {replyingTo ===
                                        notification.notificationId ? (
                                            <>
                                                <textarea
                                                    value={
                                                        replyMessage
                                                    }
                                                    onChange={(e) =>
                                                        setReplyMessage(
                                                            e.target.value
                                                        )
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    rows={3}
                                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
                                                    placeholder="Write your reply..."
                                                />

                                                <div className="mt-3 flex gap-3">

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            sendReply(
                                                                notification
                                                            );
                                                        }}
                                                        disabled={
                                                            sendingReply
                                                        }
                                                        className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black"
                                                    >
                                                        {sendingReply
                                                            ? "Sending..."
                                                            : "Send Reply"}
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            setReplyingTo(
                                                                null
                                                            );

                                                            setReplyMessage(
                                                                ""
                                                            );
                                                        }}
                                                        className="rounded-lg border border-slate-700 px-4 py-2 text-white"
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    setReplyingTo(
                                                        notification.notificationId
                                                    );
                                                }}
                                                className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black"
                                            >
                                                Reply
                                            </button>
                                        )}

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>
        );
    }

    /* =========================================================
       ADMIN NOTIFICATION PAGE
    ========================================================= */

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

            {/* Send Notification */}

            <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <div>
                    <label className="mb-2 block text-sm text-slate-300">
                        Employee
                    </label>

                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-3">

                        {employees.map(
                            (employee) => (
                                <label
                                    key={
                                        employee.employeeId
                                    }
                                    className="flex cursor-pointer items-center gap-3"
                                >

                                    <input
                                        type="checkbox"
                                        checked={recipientEmails.includes(
                                            employee.email
                                        )}
                                        onChange={(e) => {
                                            if (
                                                e.target.checked
                                            ) {
                                                setRecipientEmails(
                                                    (prev) => [
                                                        ...prev,
                                                        employee.email,
                                                    ]
                                                );
                                            } else {
                                                setRecipientEmails(
                                                    (prev) =>
                                                        prev.filter(
                                                            (email) =>
                                                                email !==
                                                                employee.email
                                                        )
                                                );
                                            }
                                        }}
                                    />

                                    <span className="text-white">
                                        {
                                            employee.name
                                        }{" "}
                                        (
                                        {
                                            employee.role
                                        }
                                        )
                                    </span>

                                    <span className="text-sm text-slate-400">
                                        {
                                            employee.email
                                        }
                                    </span>

                                </label>
                            )
                        )}

                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-300">
                        Title
                    </label>

                    <input
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
                            )
                        }
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
                        onChange={(e) =>
                            setMessage(
                                e.target.value
                            )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        placeholder="Write notification..."
                    />
                </div>

                <button
                    onClick={sendNotification}
                    disabled={sending}
                    className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
                >
                    {sending
                        ? "Sending..."
                        : "Send Notification"}
                </button>

            </div>

            {/* Sent Notifications */}

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="mb-4 text-xl font-bold text-white">
                    Sent Notifications
                </h2>

                {sentNotifications.length === 0 ? (
                    <p className="text-slate-400">
                        No notifications sent yet.
                    </p>
                ) : (
                    <div className="space-y-4">

                        {sentNotifications.map(
                            (notification: any) => (
                                <div
                                    key={
                                        notification.notificationId
                                    }
                                    className="rounded-xl border border-slate-700 p-4"
                                >

                                    <h3 className="text-lg font-semibold text-white">
                                        {
                                            notification.title
                                        }
                                    </h3>

                                    <p className="mt-2 text-slate-300">
                                        {
                                            notification.message
                                        }
                                    </p>

                                    <p className="mt-2 text-sm text-slate-400">
                                        To:{" "}
                                        {
                                            notification.recipientEmail
                                        }
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    <div className="mt-4 border-t border-slate-700 pt-3">

                                        <h4 className="mb-2 font-semibold text-white">
                                            Replies
                                        </h4>

                                        {replies[
                                            notification
                                                .notificationId
                                        ]?.length ? (
                                            replies[
                                                notification
                                                    .notificationId
                                            ].map(
                                                (
                                                    reply: any
                                                ) => (
                                                    <div
                                                        key={
                                                            reply.replyId
                                                        }
                                                        className="mb-3 rounded-lg bg-slate-800 p-3"
                                                    >

                                                        <p className="text-sm font-semibold text-cyan-400">
                                                            {
                                                                reply.senderEmail
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-white">
                                                            {
                                                                reply.message
                                                            }
                                                        </p>

                                                        <p className="mt-2 text-xs text-slate-500">
                                                            {new Date(
                                                                reply.createdAt
                                                            ).toLocaleString()}
                                                        </p>

                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No replies yet.
                                            </p>
                                        )}

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}