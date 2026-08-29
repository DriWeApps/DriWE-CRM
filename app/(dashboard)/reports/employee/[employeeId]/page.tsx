// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   ClipboardList,
//   CalendarDays,
//   PhoneCall,
//   CheckCircle2,
// } from "lucide-react";

// interface Report {
//   employee: {
//     employeeId: string;
//     firstName: string;
//     lastName: string;
//     designation: string;
//     department: string;
//     email: string;
//   };

//   summary: {
//     totalTasks: number;
//     completedTasks: number;
//     pendingTasks: number;
//     totalMeetings: number;
//     totalFollowups: number;
//   };

//   tasks: any[];
//   meetings: any[];
//   followups: any[];
// }

// export default function EmployeeReportPage() {
//   const { employeeId } = useParams();
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [report, setReport] = useState<Report | null>(null);

//   useEffect(() => {
//     fetchReport();
//   }, []);

//   async function fetchReport() {
//     try {
//       const res = await fetch(`/api/reports/employee/${employeeId}`);
//       const data = await res.json();

//       if (data.success) {
//         setReport(data.report);
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="p-6 text-white">
//         Loading report...
//       </div>
//     );
//   }

//   if (!report) {
//     return (
//       <div className="p-6 text-red-400">
//         Report not found.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">

//       {/* Header */}

//       <div className="flex items-center gap-4">

//         <Link
//           href="/reports"
//           className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
//         >
//           <ArrowLeft className="text-white" size={18} />
//         </Link>

//         <div>
//           <h1 className="text-3xl font-bold text-white">
//             Employee Report
//           </h1>

//           <p className="text-slate-400">
//             Detailed performance report
//           </p>
//         </div>

//       </div>

//       {/* Employee Details */}

//       <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">

//         <h2 className="text-xl font-semibold text-white">
//           Employee Details
//         </h2>

//         <div className="mt-5 grid gap-4 md:grid-cols-2">

//           <div>
//             <p className="text-slate-400 text-sm">Name</p>
//             <p className="text-white font-medium">
//               {report.employee.firstName} {report.employee.lastName}
//             </p>
//           </div>

//           <div>
//             <p className="text-slate-400 text-sm">Designation</p>
//             <p className="text-white">
//               {report.employee.designation}
//             </p>
//           </div>

//           <div>
//             <p className="text-slate-400 text-sm">Department</p>
//             <p className="text-white">
//               {report.employee.department}
//             </p>
//           </div>

//           <div>
//             <p className="text-slate-400 text-sm">Email</p>
//             <p className="text-white">
//               {report.employee.email}
//             </p>
//           </div>

//         </div>

//       </div>

//       {/* Summary */}

//       <div className="grid gap-5 md:grid-cols-5">

//         <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
//           <ClipboardList className="text-cyan-400" />
//           <h2 className="mt-3 text-3xl font-bold text-white">
//             {report.summary.totalTasks}
//           </h2>
//           <p className="text-slate-400">
//             Total Tasks
//           </p>
//         </div>

//         <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
//           <CheckCircle2 className="text-green-400" />
//           <h2 className="mt-3 text-3xl font-bold text-white">
//             {report.summary.completedTasks}
//           </h2>
//           <p className="text-slate-400">
//             Completed
//           </p>
//         </div>

//         <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
//           <ClipboardList className="text-yellow-400" />
//           <h2 className="mt-3 text-3xl font-bold text-white">
//             {report.summary.pendingTasks}
//           </h2>
//           <p className="text-slate-400">
//             Pending
//           </p>
//         </div>

//         <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
//           <CalendarDays className="text-purple-400" />
//           <h2 className="mt-3 text-3xl font-bold text-white">
//             {report.summary.totalMeetings}
//           </h2>
//           <p className="text-slate-400">
//             Meetings
//           </p>
//         </div>

//         <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
//           <PhoneCall className="text-pink-400" />
//           <h2 className="mt-3 text-3xl font-bold text-white">
//             {report.summary.totalFollowups}
//           </h2>
//           <p className="text-slate-400">
//             Follow-ups
//           </p>
//         </div>

//       </div>

//       {/* Tasks */}

//       <div className="rounded-xl border border-slate-800 bg-slate-950">

//         <div className="border-b border-slate-800 p-4">
//           <h2 className="text-lg font-semibold text-white">
//             Tasks
//           </h2>
//         </div>

//         <div className="divide-y divide-slate-800">

//           {report.tasks.length === 0 ? (
//             <p className="p-5 text-slate-400">
//               No tasks found.
//             </p>
//           ) : (
//             report.tasks.map((task: any) => (
//               <div
//                 key={task.taskId}
//                 className="p-5"
//               >
//                 <h3 className="font-medium text-white">
//                   {task.title}
//                 </h3>

//                 <p className="text-sm text-slate-400 mt-1">
//                   Status : {task.status}
//                 </p>
//               </div>
//             ))
//           )}

//         </div>

//       </div>

//       {/* Meetings */}

//       <div className="rounded-xl border border-slate-800 bg-slate-950">

//         <div className="border-b border-slate-800 p-4">
//           <h2 className="text-lg font-semibold text-white">
//             Meetings
//           </h2>
//         </div>

//         <div className="divide-y divide-slate-800">

//           {report.meetings.length === 0 ? (
//             <p className="p-5 text-slate-400">
//               No meetings found.
//             </p>
//           ) : (
//             report.meetings.map((meeting: any) => (
//               <div
//                 key={meeting.meetingId}
//                 className="p-5"
//               >
//                 <h3 className="font-medium text-white">
//                   {meeting.title}
//                 </h3>

//                 <p className="text-sm text-slate-400 mt-1">
//                   {meeting.date} • {meeting.time}
//                 </p>
//               </div>
//             ))
//           )}

//         </div>

//       </div>

//       {/* Follow-ups */}

//       <div className="rounded-xl border border-slate-800 bg-slate-950">

//         <div className="border-b border-slate-800 p-4">
//           <h2 className="text-lg font-semibold text-white">
//             Follow-ups
//           </h2>
//         </div>

//         <div className="divide-y divide-slate-800">

//           {report.followups.length === 0 ? (
//             <p className="p-5 text-slate-400">
//               No follow-ups found.
//             </p>
//           ) : (
//             report.followups.map((item: any) => (
//               <div
//                 key={item.followUpId}
//                 className="p-5"
//               >
//                 <h3 className="font-medium text-white">
//                   {item.title}
//                 </h3>

//                 <p className="text-sm text-slate-400 mt-1">
//                   {item.followupDate}
//                 </p>
//               </div>
//             ))
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
ArrowLeft,
ClipboardList,
CalendarDays,
PhoneCall,
CheckCircle2,
Clock3,
LogIn,
LogOut,
UserCheck,
} from "lucide-react";

interface Attendance {
sessionId: string;
employeeId: string;
userId: string;
email: string;

loginAt: string;
logoutAt?: string;

loginDate: string;

status:
| "Logged In"
| "Logged Out";
}

interface Report {
employee: {
employeeId: string;
firstName: string;
lastName: string;
designation: string;
department: string;
email: string;
};

summary: {
totalTasks: number;
completedTasks: number;
pendingTasks: number;
totalMeetings: number;
totalFollowups: number;
totalLoginSessions?: number;
};

attendance: Attendance[];

tasks: any[];
meetings: any[];
followups: any[];
}

/* =====================================================
FORMAT DATE
===================================================== */

function formatDate(dateString: string) {
if (!dateString) {
return "-";
}

return new Date(
dateString
).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
}

/* =====================================================
FORMAT TIME
===================================================== */

function formatTime(dateString?: string) {
if (!dateString) {
return "-";
}

return new Date(
dateString
).toLocaleTimeString("en-IN", {
hour: "2-digit",
minute: "2-digit",
hour12: true,
});
}

/* =====================================================
WORKING DURATION
===================================================== */

function getDuration(
loginAt: string,
logoutAt?: string
) {
if (!logoutAt) {
return "-";
}

const start =
new Date(loginAt).getTime();

const end =
new Date(logoutAt).getTime();

const difference =
end - start;

if (difference <= 0) {
return "-";
}

const totalMinutes =
Math.floor(
difference / (1000 * 60)
);

const hours =
Math.floor(
totalMinutes / 60
);

const minutes =
totalMinutes % 60;

if (hours === 0) {
return `${minutes}m`;
}

return `${hours}h ${minutes}m`;
}

export default function EmployeeReportPage() {
const { employeeId } = useParams();

const [loading, setLoading] =
useState(true);

const [report, setReport] =
useState<Report | null>(null);

useEffect(() => {
fetchReport();
}, []);

async function fetchReport() {
try {
const res = await fetch(
`/api/reports/employee/${employeeId}`,
{
credentials: "include",
cache: "no-store",
}
);


  const data =
    await res.json();

  if (data.success) {
    setReport(data.report);
  } else {
    alert(data.message);
  }
} catch (error) {
  console.error(
    "Report Error:",
    error
  );
} finally {
  setLoading(false);
}


}

/* =====================================================
LOADING
===================================================== */

if (loading) {
return ( <div className="p-6 text-white">
Loading report... </div>
);
}

/* =====================================================
NOT FOUND
===================================================== */

if (!report) {
return ( <div className="p-6 text-red-400">
Report not found. </div>
);
}

const loggedInSessions =
report.attendance.filter(
(item) =>
item.status === "Logged In"
).length;

return ( <div className="space-y-6 p-6">

```
  {/* =================================================
      HEADER
  ================================================= */}

  <div className="flex items-center gap-4">

    <Link
      href="/reports"
      className="rounded-lg border border-slate-700 p-2 transition hover:bg-slate-800"
    >
      <ArrowLeft
        className="text-white"
        size={18}
      />
    </Link>

    <div>
      <h1 className="text-3xl font-bold text-white">
        Employee Report
      </h1>

      <p className="text-slate-400">
        Detailed performance and attendance report
      </p>
    </div>

  </div>

  {/* =================================================
      EMPLOYEE DETAILS
  ================================================= */}

  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">

    <h2 className="text-xl font-semibold text-white">
      Employee Details
    </h2>

    <div className="mt-5 grid gap-4 md:grid-cols-2">

      <div>
        <p className="text-sm text-slate-400">
          Name
        </p>

        <p className="font-medium text-white">
          {report.employee.firstName}{" "}
          {report.employee.lastName}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Designation
        </p>

        <p className="text-white">
          {report.employee.designation}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Department
        </p>

        <p className="text-white">
          {report.employee.department}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Email
        </p>

        <p className="text-white">
          {report.employee.email}
        </p>
      </div>

    </div>

  </div>

  {/* =================================================
      SUMMARY
  ================================================= */}

  <div className="grid gap-5 md:grid-cols-5">

    {/* Tasks */}

    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <ClipboardList className="text-cyan-400" />

      <h2 className="mt-3 text-3xl font-bold text-white">
        {report.summary.totalTasks}
      </h2>

      <p className="text-slate-400">
        Total Tasks
      </p>

    </div>

    {/* Completed */}

    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <CheckCircle2 className="text-green-400" />

      <h2 className="mt-3 text-3xl font-bold text-white">
        {report.summary.completedTasks}
      </h2>

      <p className="text-slate-400">
        Completed
      </p>

    </div>

    {/* Pending */}

    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <ClipboardList className="text-yellow-400" />

      <h2 className="mt-3 text-3xl font-bold text-white">
        {report.summary.pendingTasks}
      </h2>

      <p className="text-slate-400">
        Pending
      </p>

    </div>

    {/* Meetings */}

    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <CalendarDays className="text-purple-400" />

      <h2 className="mt-3 text-3xl font-bold text-white">
        {report.summary.totalMeetings}
      </h2>

      <p className="text-slate-400">
        Meetings
      </p>

    </div>

    {/* Login Sessions */}

    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

      <Clock3 className="text-orange-400" />

      <h2 className="mt-3 text-3xl font-bold text-white">
        {report.summary.totalLoginSessions ?? 0}
      </h2>

      <p className="text-slate-400">
        Login Sessions
      </p>

      {loggedInSessions > 0 && (
        <p className="mt-2 text-xs text-green-400">
          Currently logged in
        </p>
      )}

    </div>

  </div>

  {/* =================================================
      LOGIN / LOGOUT HISTORY
  ================================================= */}

  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">

    {/* Header */}

    <div className="flex items-center justify-between border-b border-slate-800 p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">

          <UserCheck
            size={20}
            className="text-cyan-400"
          />

        </div>

        <div>

          <h2 className="text-lg font-semibold text-white">
            Login & Logout History
          </h2>

          <p className="text-sm text-slate-400">
            Employee attendance and working sessions
          </p>

        </div>

      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
        {report.attendance.length} sessions
      </div>

    </div>

    {/* Desktop Table */}

    {report.attendance.length === 0 ? (

      <div className="p-10 text-center">

        <Clock3
          size={40}
          className="mx-auto mb-3 text-slate-700"
        />

        <p className="text-slate-400">
          No login activity recorded yet.
        </p>

      </div>

    ) : (

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-slate-800 bg-slate-900/60">

            <tr>

              <th className="px-5 py-4 text-sm font-medium text-slate-400">
                Date
              </th>

              <th className="px-5 py-4 text-sm font-medium text-slate-400">
                Login Time
              </th>

              <th className="px-5 py-4 text-sm font-medium text-slate-400">
                Logout Time
              </th>

              <th className="px-5 py-4 text-sm font-medium text-slate-400">
                Working Duration
              </th>

              <th className="px-5 py-4 text-sm font-medium text-slate-400">
                Status
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-800">

            {report.attendance.map(
              (session) => (

                <tr
                  key={session.sessionId}
                  className="transition hover:bg-slate-900/50"
                >

                  {/* Date */}

                  <td className="px-5 py-4">

                    <div className="font-medium text-white">
                      {formatDate(
                        session.loginAt
                      )}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {session.loginDate}
                    </div>

                  </td>

                  {/* Login */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <LogIn
                        size={16}
                        className="text-green-400"
                      />

                      <span className="text-white">
                        {formatTime(
                          session.loginAt
                        )}
                      </span>

                    </div>

                  </td>

                  {/* Logout */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <LogOut
                        size={16}
                        className={
                          session.logoutAt
                            ? "text-red-400"
                            : "text-slate-600"
                        }
                      />

                      <span className="text-white">

                        {session.logoutAt
                          ? formatTime(
                              session.logoutAt
                            )
                          : "Not logged out"}

                      </span>

                    </div>

                  </td>

                  {/* Duration */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <Clock3
                        size={16}
                        className="text-cyan-400"
                      />

                      <span className="text-white">
                        {getDuration(
                          session.loginAt,
                          session.logoutAt
                        )}
                      </span>

                    </div>

                  </td>

                  {/* Status */}

                  <td className="px-5 py-4">

                    {session.status ===
                    "Logged In" ? (

                      <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">

                        <span className="h-2 w-2 rounded-full bg-green-400" />

                        Currently Logged In

                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">

                        Logged Out

                      </span>

                    )}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    )}

  </div>

  {/* =================================================
      TASKS
  ================================================= */}

  <div className="rounded-xl border border-slate-800 bg-slate-950">

    <div className="border-b border-slate-800 p-4">

      <h2 className="text-lg font-semibold text-white">
        Tasks
      </h2>

    </div>

    <div className="divide-y divide-slate-800">

      {report.tasks.length === 0 ? (

        <p className="p-5 text-slate-400">
          No tasks found.
        </p>

      ) : (

        report.tasks.map(
          (task: any) => (

            <div
              key={task.taskId}
              className="p-5"
            >

              <h3 className="font-medium text-white">
                {task.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Status : {task.status}
              </p>

            </div>

          )
        )

      )}

    </div>

  </div>

  {/* =================================================
      MEETINGS
  ================================================= */}

  <div className="rounded-xl border border-slate-800 bg-slate-950">

    <div className="border-b border-slate-800 p-4">

      <h2 className="text-lg font-semibold text-white">
        Meetings
      </h2>

    </div>

    <div className="divide-y divide-slate-800">

      {report.meetings.length === 0 ? (

        <p className="p-5 text-slate-400">
          No meetings found.
        </p>

      ) : (

        report.meetings.map(
          (meeting: any) => (

            <div
              key={meeting.meetingId}
              className="p-5"
            >

              <h3 className="font-medium text-white">
                {meeting.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {meeting.date} •{" "}
                {meeting.time}
              </p>

            </div>

          )
        )

      )}

    </div>

  </div>

  {/* =================================================
      FOLLOW-UPS
  ================================================= */}

  <div className="rounded-xl border border-slate-800 bg-slate-950">

    <div className="border-b border-slate-800 p-4">

      <h2 className="text-lg font-semibold text-white">
        Follow-ups
      </h2>

    </div>

    <div className="divide-y divide-slate-800">

      {report.followups.length === 0 ? (

        <p className="p-5 text-slate-400">
          No follow-ups found.
        </p>

      ) : (

        report.followups.map(
          (item: any) => (

            <div
              key={item.followUpId}
              className="p-5"
            >

              <h3 className="font-medium text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {item.followupDate}
              </p>

            </div>

          )
        )

      )}

    </div>

  </div>

</div>


);
}
