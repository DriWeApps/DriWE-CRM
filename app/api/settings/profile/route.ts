// import { NextResponse } from "next/server";

// import { getUserFromRequest } from "@/lib/auth";
// import { getEmployeeById } from "@/services/employee.service";
// import { getUserByEmail } from "@/services/auth.service";

// export async function GET(req: Request) {
//   try {
//     // Get logged-in user from JWT
//     const session = await getUserFromRequest(req);

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     // Get employee record
//     let employee = null;

//     if (session.employeeId) {
//       employee = await getEmployeeById(session.employeeId);
//     }

//     // Get user record
//     let user = null;

//     if (session.email) {
//       user = await getUserByEmail(session.email);
//     }

//     /*
//      * Employee data is the main source.
//      * User data is used as a fallback for fields
//      * that may not exist in the employee record.
//      */
//     const profile = {
//       firstName:
//         employee?.firstName ||
//         user?.name?.split(" ")[0] ||
//         "",

//       lastName:
//         employee?.lastName ||
//         user?.name?.split(" ").slice(1).join(" ") ||
//         "",

//       email:
//         employee?.email ||
//         user?.email ||
//         session.email ||
//         "",

//       mobile:
//         employee?.mobile ||
//         "",

//       designation:
//         employee?.designation ||
//         "",

//       department:
//         employee?.department ||
//         "",

//       role:
//         employee?.role ||
//         user?.role ||
//         session.role ||
//         "",

//       status:
//         employee?.status ||
//         "",

//       dob:
//         employee?.dob ||
//         "",

//       address:
//         employee?.address ||
//         "",

//       city:
//         employee?.city ||
//         "",

//       pincode:
//         employee?.pincode ||
//         "",
//     };

//     return NextResponse.json({
//       success: true,
//       user: profile,
//     });
//   } catch (error) {
//     console.error("GET PROFILE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch profile",
//       },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { getEmployeeById } from "@/services/employee.service";
import { getUserByEmail } from "@/services/auth.service";

export async function GET(req: Request) {
  try {
    const session = await getUserFromRequest(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.log("Profile Session:", session);

    // -----------------------------------------
    // GET USER FROM USERS TABLE
    // -----------------------------------------

    const dbUser = await getUserByEmail(session.email);

    // -----------------------------------------
    // GET EMPLOYEE FROM EMPLOYEES TABLE
    // -----------------------------------------

    let employee = null;

    if (session.employeeId) {
      try {
        employee = await getEmployeeById(session.employeeId);
      } catch (error) {
        console.error("Employee lookup failed:", error);
      }
    }

    // -----------------------------------------
    // NAME
    // -----------------------------------------

    const fullName = dbUser?.name || "";

    const nameParts = fullName.trim().split(/\s+/);

    const firstName =
      employee?.firstName ||
      nameParts[0] ||
      "";

    const lastName =
      employee?.lastName ||
      nameParts.slice(1).join(" ") ||
      "";

    // -----------------------------------------
    // COMPLETE PROFILE
    // -----------------------------------------

    const profile = {
      firstName,

      lastName,

      email:
        employee?.email ||
        dbUser?.email ||
        session.email ||
        "",

      mobile:
        employee?.mobile ||
        employee?.phone ||
        "",

      designation:
        employee?.designation ||
        "",

      department:
        employee?.department ||
        "",

      role:
        employee?.role ||
        dbUser?.role ||
        session.role ||
        "",

      employeeId:
        employee?.employeeId ||
        dbUser?.employeeId ||
        session.employeeId ||
        "",

      userId:
        dbUser?.userId ||
        session.userId ||
        "",

      status:
        employee?.status ||
        "",

      joiningDate:
        employee?.joiningDate ||
        "",

      dateOfBirth:
        employee?.dateOfBirth ||
        "",

      gender:
        employee?.gender ||
        "",

      address:
        employee?.address ||
        "",

      city:
        employee?.city ||
        "",

      state:
        employee?.state ||
        "",

      pincode:
        employee?.pincode ||
        "",

      country:
        employee?.country ||
        "",

      createdAt:
        employee?.createdAt ||
        dbUser?.createdAt ||
        "",

      updatedAt:
        employee?.updatedAt ||
        dbUser?.updatedAt ||
        "",
    };
    console.log("Complete Profile:", profile);

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}