// import { NextResponse } from "next/server";

// export async function POST() {
//   const response = NextResponse.json({
//     success: true,
//   });

//   response.cookies.set("token", "", {
//     httpOnly: true,
//     expires: new Date(0),
//     path: "/",
//   });

//   return response;
// }


import { NextResponse } from "next/server";

import {
getUserFromRequest,
} from "@/lib/auth";

import {
logoutAttendanceSession,
} from "@/services/attendance.service";

export async function POST(req: Request) {
try {
/*
* Get currently logged-in user
* from the JWT cookie.
*/
const user = await getUserFromRequest(req);


if (user) {
  try {
    await logoutAttendanceSession(
      user.userId
    );
  } catch (attendanceError) {
    console.error(
      "Attendance logout tracking error:",
      attendanceError
    );
  }
}

/*
 * Remove authentication cookie.
 */
const response = NextResponse.json({
  success: true,
});

response.cookies.set("token", "", {
  httpOnly: true,

  expires: new Date(0),

  path: "/",
});

return response;

} catch (error) {
console.error(
"Logout Error:",
error
);


/*
 * Even if attendance tracking fails,
 * still clear the authentication cookie.
 */
const response = NextResponse.json({
  success: true,
});

response.cookies.set("token", "", {
  httpOnly: true,

  expires: new Date(0),

  path: "/",
});

return response;


}
}
