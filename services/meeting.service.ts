import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE_NAME = "CRM_Meetings";

export interface MeetingParticipant {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;

  joined?: boolean;
  joinedAt?: string;

  actionTaken?: string;
  decision?: string;
}

export interface Meeting {
  meetingId: string;

  title: string;

  companyId: string;
  companyName: string;

  meetingLink: string;

  description: string;

  date: string;
  time: string;

  status: string;

  createdBy: string;
  createdByName: string;

  participants: MeetingParticipant[];

  createdAt: string;
  updatedAt: string;
}

export async function getMeetings() {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return (result.Items ?? []) as Meeting[];
}

export async function getMeetingById(meetingId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        meetingId,
      },
    })
  );

  return result.Item as Meeting | undefined;
}

export async function createMeeting(meeting: Meeting) {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: meeting,
    })
  );

  return meeting;
}

export async function updateMeeting(
  meetingId: string,
  meeting: Partial<Meeting>
) {
  const oldMeeting = await getMeetingById(meetingId);

  if (!oldMeeting) {
    throw new Error("Meeting not found");
  }

  const updatedMeeting: Meeting = {
    ...oldMeeting,
    ...meeting,
    meetingId,
    updatedAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedMeeting,
    })
  );

  return updatedMeeting;
}

export async function deleteMeeting(meetingId: string) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        meetingId,
      },
    })
  );
}

export async function markAttendance(
  meetingId: string,
  employeeEmail: string,
  joined: boolean,
  actionTaken: string,
  decision: string
) {
  const meeting = await getMeetingById(meetingId);

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const participants =
    meeting.participants?.map((participant) => {
      if (participant.employeeEmail !== employeeEmail) {
        return participant;
      }

      return {
        ...participant,
        joined,
        joinedAt: joined ? new Date().toISOString() : "",
        actionTaken,
        decision,
      };
    }) ?? [];

  return updateMeeting(meetingId, {
    participants,
  });
}