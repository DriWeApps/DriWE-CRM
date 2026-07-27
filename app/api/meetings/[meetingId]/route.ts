import { NextResponse } from "next/server";

import {
  getMeetingById,
  updateMeeting,
  deleteMeeting,
} from "@/services/meeting.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

interface Params {
  params: Promise<{
    meetingId: string;
  }>;
}

/* ---------------- GET ---------------- */

export async function GET(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { meetingId } = await params;

    const meeting = await getMeetingById(meetingId);

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    const isAdmin = isAdminUser(user);
const isManager = user.role === "Manager";

const isMeetingCreator =
  meeting.createdBy === user.userId ||
  meeting.createdByEmail === user.email;

const isParticipant = meeting.participants?.some(
  (p: any) =>
    p.employeeEmail === user.email ||
    p.employeeId === user.employeeId
);

console.log("Meeting Permission Check:", {
  userId: user.userId,
  employeeId: user.employeeId,
  email: user.email,
  role: user.role,

  meetingCreatedBy: meeting.createdBy,
  meetingCreatedByEmail: meeting.createdByEmail,

  isAdmin,
  isManager,
  isMeetingCreator,
  isParticipant,
});

if (
  !isAdmin &&
  !isManager &&
  !isMeetingCreator &&
  !isParticipant
) {
  return NextResponse.json(
    {
      success: false,
      message: "You do not have permission to view this meeting",
    },
    { status: 403 }
  );
}
    return NextResponse.json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch meeting",
      },
      { status: 500 }
    );
  }
}

/* ---------------- PUT ---------------- */

// export async function PUT(
//   req: Request,
//   { params }: Params
// ) {
//   try {
//     const user = await getUserFromRequest(req);

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     const { meetingId } = await params;

//     const meeting = await getMeetingById(meetingId);

//     if (!meeting) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Meeting not found",
//         },
//         { status: 404 }
//       );
//     }

//     const body = await req.json();

//     const isManager = user.role === "Manager";

//     /* ==========================================
//        EMPLOYEE UPDATE
//     ========================================== */

//     if (!isAdminUser(user) && !isManager) {
//       const startTime = new Date(
//         `${meeting.date}T${meeting.time}`
//       );

//       const joinDeadline = new Date(
//         startTime.getTime() + 10 * 60 * 1000
//       );

//       if (new Date() > joinDeadline) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Meeting joining time has expired. Please contact your manager.",
//           },
//           { status: 403 }
//         );
//       }

//       const participants = meeting.participants.map((p: any) => {
//         if (p.employeeEmail !== user.email) return p;

//         return {
//           ...p,
//           joined: true,
//           joinedAt: new Date().toISOString(),
//         };
//       });

//       await updateMeeting(meetingId, {
//         ...meeting,
//         participants,
//       });

//       return NextResponse.json({
//         success: true,
//         message: "Attendance updated",
//       });
//     }

//     /* ==========================================
//        ADMIN / MANAGER UPDATE
//     ========================================== */

//     let status = body.status ?? meeting.status;

//     // Auto complete meeting if requested
//     if (status === "Completed") {
//       status = "Completed";
//     }

//     const updatedMeeting = {
//       ...meeting,
//       ...body,
//       status,
//       decision: body.decision ?? meeting.decision,
//       actionTaken:
//         body.actionTaken ?? meeting.actionTaken,
//       updatedAt: new Date().toISOString(),
//     };

//     await updateMeeting(meetingId, updatedMeeting);

//     return NextResponse.json({
//       success: true,
//       meeting: updatedMeeting,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to update meeting",
//       },
//       { status: 500 }
//     );
//   }
// }


/* ---------------- PUT ---------------- */

export async function PUT(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { meetingId } = await params;

    const meeting = await getMeetingById(meetingId);

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    const body = await req.json();

    const isAdmin = isAdminUser(user);
    const isManager = user.role === "Manager";
    const isMeetingCreator =
      meeting.createdBy === user.userId;

    /* ==========================================
       EMPLOYEE WHO CREATED THE MEETING
       CAN EDIT THEIR OWN MEETING
    ========================================== */

    if (
      !isAdmin &&
      !isManager &&
      isMeetingCreator
    ) {
      const updatedMeeting = {
        ...meeting,
        ...body,

        // Never allow ownership to be changed
        createdBy: meeting.createdBy,
        // createdByEmail: meeting.createdByEmail,
        createdByName: meeting.createdByName,

        decision:
          body.decision ?? meeting.decision ?? "",

        actionTaken:
          body.actionTaken ?? meeting.actionTaken ?? "",

        updatedAt: new Date().toISOString(),
      };

      await updateMeeting(
        meetingId,
        updatedMeeting
      );

      return NextResponse.json({
        success: true,
        message: "Meeting updated successfully",
        meeting: updatedMeeting,
      });
    }

    /* ==========================================
       OTHER EMPLOYEE
       CAN ONLY MARK ATTENDANCE
    ========================================== */

    if (!isAdmin && !isManager) {
      const startTime = new Date(
        `${meeting.date}T${meeting.time}`
      );

      const joinDeadline = new Date(
        startTime.getTime() + 10 * 60 * 1000
      );

      if (new Date() > joinDeadline) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Meeting joining time has expired. Please contact your manager.",
          },
          { status: 403 }
        );
      }

      const participants =
        meeting.participants?.map((p: any) => {
          if (p.employeeEmail !== user.email) {
            return p;
          }

          return {
            ...p,
            joined: true,
            joinedAt: new Date().toISOString(),
          };
        }) || [];

      await updateMeeting(meetingId, {
        ...meeting,
        participants,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Attendance updated",
      });
    }

    /* ==========================================
       ADMIN / MANAGER UPDATE
    ========================================== */

    let status =
      body.status ?? meeting.status;

    if (status === "Completed") {
      status = "Completed";
    }

    const updatedMeeting = {
      ...meeting,
      ...body,

      status,

      decision:
        body.decision ?? meeting.decision ?? "",

      actionTaken:
        body.actionTaken ?? meeting.actionTaken ?? "",

      // Preserve creator
      createdBy: meeting.createdBy,
      // createdByEmail: meeting.createdByEmail,
      createdByName: meeting.createdByName,

      updatedAt: new Date().toISOString(),
    };

    await updateMeeting(
      meetingId,
      updatedMeeting
    );

    return NextResponse.json({
      success: true,
      message: "Meeting updated successfully",
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error("UPDATE Meeting Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update meeting",
      },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE ---------------- */

// export async function DELETE(
//   req: Request,
//   { params }: Params
// ) {
//   try {
//     const user = await getUserFromRequest(req);

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     const { meetingId } = await params;

//     const meeting = await getMeetingById(meetingId);

//     if (!meeting) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Meeting not found",
//         },
//         { status: 404 }
//       );
//     }

//     const isManager = user.role === "Manager";

//     // Admin can delete any meeting
//     if (isAdminUser(user)) {
//       await deleteMeeting(meetingId);

//       return NextResponse.json({
//         success: true,
//       });
//     }

//     // Manager can delete only meetings created by them
//     if (
//       isManager &&
//       meeting.createdBy === user.userId
//     ) {
//       await deleteMeeting(meetingId);

//       return NextResponse.json({
//         success: true,
//       });
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Permission denied",
//       },
//       { status: 403 }
//     );
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Delete failed",
//       },
//       { status: 500 }
//     );
//   }
// }
/* ---------------- DELETE ---------------- */

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { meetingId } = await params;

    const meeting = await getMeetingById(meetingId);

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    const isAdmin = isAdminUser(user);
    const isManager = user.role === "Manager";

    // Admin and Manager can delete any meeting
    if (isAdmin || isManager) {
      await deleteMeeting(meetingId);

      return NextResponse.json({
        success: true,
        message: "Meeting deleted successfully",
      });
    }

    // Employees cannot delete meetings
    return NextResponse.json(
      {
        success: false,
        message: "Only Admin and Manager can delete meetings",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("DELETE Meeting Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete meeting",
      },
      { status: 500 }
    );
  }
}