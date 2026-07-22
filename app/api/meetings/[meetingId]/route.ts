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

/**
 * GET MEETING BY ID
 */
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
        {
          status: 401,
        }
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
        {
          status: 404,
        }
      );
    }

    const isManager = user.role === "Manager";

    // Employees can only view meetings where they are participants
    if (!isAdminUser(user) && !isManager) {
      const allowed = meeting.participants?.some(
        (participant) => participant.employeeEmail === user.email
      );

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden",
          },
          {
            status: 403,
          }
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
      {
        status: 500,
      }
    );
  }
}

/**
 * UPDATE MEETING
 */
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
        {
          status: 401,
        }
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
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    const isManager = user.role === "Manager";

    // Employee can update only their own attendance
    if (!isAdminUser(user) && !isManager) {

      const participants = meeting.participants.map((participant) => {

        if (participant.employeeEmail !== user.email) {
          return participant;
        }

        return {
          ...participant,
          joined: body.joined,
          joinedAt: body.joined
            ? new Date().toISOString()
            : "",
          actionTaken: body.actionTaken,
          decision: body.decision,
        };

      });

      const updated = await updateMeeting(meetingId, {
        participants,
      });

      return NextResponse.json({
        success: true,
        meeting: updated,
      });

    }

    // Admin & Manager can edit everything
    const updated = await updateMeeting(meetingId, {
      ...meeting,
      ...body,
    });

    return NextResponse.json({
      success: true,
      meeting: updated,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update meeting",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE MEETING
 */
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
        {
          status: 401,
        }
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
        {
          status: 404,
        }
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

    // Manager can delete only meetings they created
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
      {
        status: 403,
      }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}