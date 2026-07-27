// import { NextResponse } from "next/server";
// import {
//   PutCommand,
//   ScanCommand,
// } from "@aws-sdk/lib-dynamodb";

// import { db } from "@/lib/dynamodb";

// const TABLE_NAME = "CRM_Meetings";


// // GET ALL MEETINGS
// export async function GET() {
//   try {
//     const result = await db.send(
//       new ScanCommand({
//         TableName: TABLE_NAME,
//       })
//     );


//     return NextResponse.json({
//       success: true,
//       meetings: result.Items || [],
//     });


//   } catch (error) {

//     console.error("GET Meetings Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch meetings"
//       },
//       {
//         status: 500
//       }
//     );

//   }
// }


// // CREATE MEETING
// // CREATE MEETING
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const {
//       title,

//       companyId,
//       companyName,

//       participants,

//       meetingLink,

//       agenda,

//       date,
//       time,

//       status,

//       description,
//     } = body;

//     if (
//       !title ||
//       !companyId ||
//       !participants ||
//       participants.length === 0 ||
//       !date ||
//       !time
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Required fields missing",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const meeting = {
//       meetingId: crypto.randomUUID(),

//       title,

//       companyId,
//       companyName,

//       participants,

//       meetingLink: meetingLink || "",

//       agenda: agenda || "",

//       date,
//       time,

//       status: status || "Scheduled",

//       description: description || "",

//       decision: "",

//       actionTaken: "",

//       createdAt: new Date().toISOString(),

//       updatedAt: new Date().toISOString(),
//     };

//     await db.send(
//       new PutCommand({
//         TableName: TABLE_NAME,
//         Item: meeting,
//       })
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Meeting created successfully",
//       meeting,
//     });
//   } catch (error) {
//     console.error("CREATE Meeting Error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create meeting",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

import { NextResponse } from "next/server";
import {
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";
import { getUserFromRequest } from "@/lib/auth";

const TABLE_NAME = "CRM_Meetings";

/* ---------------- GET ALL MEETINGS ---------------- */

export async function GET(req: Request) {
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

    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    return NextResponse.json({
      success: true,
      meetings: result.Items || [],
    });
  } catch (error) {
    console.error("GET Meetings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch meetings",
      },
      { status: 500 }
    );
  }
}

/* ---------------- CREATE MEETING ---------------- */

export async function POST(req: Request) {
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

    const body = await req.json();

    const {
      title,
      companyId,
      companyName,
      participants,
      meetingLink,
      agenda,
      date,
      time,
      status,
      description,
    } = body;

    if (
      !title ||
      !companyId ||
      !participants ||
      participants.length === 0 ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields missing",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const meeting = {
      meetingId: crypto.randomUUID(),

      title,

      companyId,
      companyName,

      participants,

      meetingLink: meetingLink || "",

      agenda: agenda || "",

      date,
      time,

      status: status || "Scheduled",

      description: description || "",

      decision: "",

      actionTaken: "",

      // IMPORTANT
      // Save who created/scheduled this meeting
      createdBy: user.userId,
      createdByEmail: user.email,
      //  createdByName: user.name || user.email,

      createdAt: now,
      updatedAt: now,
    };

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: meeting,
      })
    );

    return NextResponse.json({
      success: true,
      message: "Meeting created successfully",
      meeting,
    });
  } catch (error) {
    console.error("CREATE Meeting Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create meeting",
      },
      { status: 500 }
    );
  }
}