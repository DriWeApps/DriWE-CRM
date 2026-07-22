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

   const isManager = user.role === "Manager";
const isMeetingCreator = meeting.createdBy === user.userId;

    if (
  !isAdminUser(user) &&
  !isManager &&
  !isMeetingCreator
) {
      const allowed = meeting.participants?.some(
        (p: any) => p.employeeEmail === user.email
      );

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden",
          },
          { status: 403 }
        );
      }
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

    const isManager = user.role === "Manager";

    /* ==========================================
       EMPLOYEE UPDATE
    ========================================== */

    if (!isAdminUser(user) && !isManager) {
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

      const participants = meeting.participants.map((p: any) => {
        if (p.employeeEmail !== user.email) return p;

        return {
          ...p,
          joined: true,
          joinedAt: new Date().toISOString(),
        };
      });

      await updateMeeting(meetingId, {
        ...meeting,
        participants,
      });

      return NextResponse.json({
        success: true,
        message: "Attendance updated",
      });
    }

    /* ==========================================
       ADMIN / MANAGER UPDATE
    ========================================== */

    let status = body.status ?? meeting.status;

    // Auto complete meeting if requested
    if (status === "Completed") {
      status = "Completed";
    }

    const updatedMeeting = {
      ...meeting,
      ...body,
      status,
      decision: body.decision ?? meeting.decision,
      actionTaken:
        body.actionTaken ?? meeting.actionTaken,
      updatedAt: new Date().toISOString(),
    };

    await updateMeeting(meetingId, updatedMeeting);

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error(error);

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

    const isManager = user.role === "Manager";

    // Admin can delete any meeting
    if (isAdminUser(user)) {
      await deleteMeeting(meetingId);

      return NextResponse.json({
        success: true,
      });
    }

    // Manager can delete only meetings created by them
    if (
      isManager &&
      meeting.createdBy === user.userId
    ) {
      await deleteMeeting(meetingId);

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Permission denied",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed",
      },
      { status: 500 }
    );
  }
}