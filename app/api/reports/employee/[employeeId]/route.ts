// import { NextResponse } from "next/server";
// import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
// import { db } from "@/lib/dynamodb";

// const EMPLOYEE_TABLE = process.env.EMPLOYEES_TABLE!;
// const TASK_TABLE = "CRM_Tasks";
// const MEETING_TABLE = "CRM_Meetings";
// const FOLLOWUP_TABLE = "CRM_FollowUps";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ employeeId: string }> }
// ) {
//   try {
//     const { employeeId } = await params;

//     // Employee Details
//     const employeeResult = await db.send(
//       new GetCommand({
//         TableName: EMPLOYEE_TABLE,
//         Key: {
//           employeeId,
//         },
//       })
//     );

//     const employee = employeeResult.Item;

//     if (!employee) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Employee not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     // Tasks
//   const tasks = await db.send(
//   new ScanCommand({
//     TableName: TASK_TABLE,
//     FilterExpression: "assignedTo = :id",
//     ExpressionAttributeValues: {
//       ":id": employeeId,
//     },
//   })
// );

//     // Meetings
//    const meetings = await db.send(
//   new ScanCommand({
//     TableName: MEETING_TABLE,
//   })
// );

// const meetingItems =
//   (meetings.Items || []).filter((meeting: any) =>
//     meeting.participants?.some(
//       (participant: any) =>
//         participant.employeeId === employeeId
//     )
//   );

//     // Follow-ups
//     const followups = await db.send(
//       new ScanCommand({
//         TableName: FOLLOWUP_TABLE,
//         FilterExpression: "employeeId = :id",
//         ExpressionAttributeValues: {
//           ":id": employeeId,
//         },
//       })
//     );

//     const taskItems = tasks.Items || [];
//     // const meetingItems = meetings.Items || [];
//     const followupItems = followups.Items || [];

//     const completedTasks = taskItems.filter(
//       (task: any) => task.status === "Completed"
//     ).length;

//     const pendingTasks = taskItems.filter(
//       (task: any) => task.status !== "Completed"
//     ).length;

//     return NextResponse.json({
//       success: true,

//       report: {
//         employee,

//         summary: {
//           totalTasks: taskItems.length,
//           completedTasks,
//           pendingTasks,
//           totalMeetings: meetingItems.length,
//           totalFollowups: followupItems.length,
//         },

//         tasks: taskItems,
//         meetings: meetingItems,
//         followups: followupItems,
//       },
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to load employee report",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }



import { NextResponse } from "next/server";
import {
ScanCommand,
GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

import {
getAttendanceByEmployeeId,
} from "@/services/attendance.service";

const EMPLOYEE_TABLE =
process.env.EMPLOYEES_TABLE!;

const TASK_TABLE = "CRM_Tasks";
const MEETING_TABLE = "CRM_Meetings";
const FOLLOWUP_TABLE = "CRM_FollowUps";

export async function GET(
req: Request,
{ params }: {
params: Promise<{
employeeId: string;
}>;
}
) {
try {
const { employeeId } = await params;


/* =====================================================
   EMPLOYEE DETAILS
===================================================== */

const employeeResult = await db.send(
  new GetCommand({
    TableName: EMPLOYEE_TABLE,

    Key: {
      employeeId,
    },
  })
);

const employee = employeeResult.Item;

if (!employee) {
  return NextResponse.json(
    {
      success: false,
      message: "Employee not found",
    },
    {
      status: 404,
    }
  );
}

/* =====================================================
   TASKS
===================================================== */

const tasks = await db.send(
  new ScanCommand({
    TableName: TASK_TABLE,

    FilterExpression:
      "assignedTo = :id",

    ExpressionAttributeValues: {
      ":id": employeeId,
    },
  })
);

/* =====================================================
   MEETINGS
===================================================== */

const meetings = await db.send(
  new ScanCommand({
    TableName: MEETING_TABLE,
  })
);

const meetingItems =
  (meetings.Items || []).filter(
    (meeting: any) =>
      meeting.participants?.some(
        (participant: any) =>
          participant.employeeId === employeeId
      )
  );

/* =====================================================
   FOLLOW-UPS
===================================================== */

const followups = await db.send(
  new ScanCommand({
    TableName: FOLLOWUP_TABLE,

    FilterExpression:
      "employeeId = :id",

    ExpressionAttributeValues: {
      ":id": employeeId,
    },
  })
);

/* =====================================================
   ATTENDANCE
===================================================== */

let attendance: any[] = [];

try {
  attendance =
    await getAttendanceByEmployeeId(
      employeeId
    );
} catch (attendanceError) {
  console.error(
    "Attendance report error:",
    attendanceError
  );

  /*
   * Do not break the complete employee report
   * if attendance table is unavailable.
   */
  attendance = [];
}

/* =====================================================
   DATA
===================================================== */

const taskItems =
  tasks.Items || [];

const followupItems =
  followups.Items || [];

/* =====================================================
   SUMMARY
===================================================== */

const completedTasks =
  taskItems.filter(
    (task: any) =>
      task.status === "Completed"
  ).length;

const pendingTasks =
  taskItems.filter(
    (task: any) =>
      task.status !== "Completed"
  ).length;

/* =====================================================
   RESPONSE
===================================================== */

return NextResponse.json({
  success: true,

  report: {
    employee,

    summary: {
      totalTasks:
        taskItems.length,

      completedTasks,

      pendingTasks,

      totalMeetings:
        meetingItems.length,

      totalFollowups:
        followupItems.length,

      totalLoginSessions:
        attendance.length,
    },

    attendance,

    tasks:
      taskItems,

    meetings:
      meetingItems,

    followups:
      followupItems,
  },
});


} catch (error) {
console.error(
"Employee Report Error:",
error
);


return NextResponse.json(
  {
    success: false,
    message:
      "Failed to load employee report",
  },
  {
    status: 500,
  }
);


}
}
