
// import { NextResponse } from "next/server";

// import {
//   deleteCompany,
//   getCompany,
//   updateCompany,
// } from "@/services/company.service";

// import { getUserFromRequest } from "@/lib/auth";

// interface RouteContext {
//   params: Promise<{
//     id: string;
//   }>;
// }

// export async function GET(req: Request, { params }: RouteContext) {
//   const { id } = await params;
//   const company = await getCompany(id);

//   return NextResponse.json({
//     success: true,
//     company,
//   });
// }

// export async function PUT(req: Request, { params }: RouteContext) {
//   const { id } = await params;
//   const body = await req.json();

//   await updateCompany(id, body);

//   return NextResponse.json({
//     success: true,
//   });
// }

// export async function DELETE(
//   req: Request,
//   { params }: RouteContext
// ) {
//   const user = await getUserFromRequest(req);

//   if (!user) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Unauthorized",
//       },
//       {
//         status: 401,
//       }
//     );
//   }

//   if (user.role !== "ADMIN") {
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Only admin can delete companies",
//       },
//       {
//         status: 403,
//       }
//     );
//   }

//   const { id } = await params;

//   await deleteCompany(id);

//   return NextResponse.json({
//     success: true,
//   });
// }


import { NextResponse } from "next/server";

import {
  deleteCompany,
  getCompany,
  updateCompany,
} from "@/services/company.service";

import { getUserFromRequest } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/* =========================================================
   GET COMPANY
========================================================= */

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const company = await getCompany(id);

  return NextResponse.json({
    success: true,
    company,
  });
}

/* =========================================================
   UPDATE COMPANY
========================================================= */

export async function PUT(req: Request, { params }: RouteContext) {
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

  const { id } = await params;

  const company = await getCompany(id);

  if (!company) {
    return NextResponse.json(
      {
        success: false,
        message: "Company not found",
      },
      { status: 404 }
    );
  }

  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "Manager";
  const isOwner = company.createdBy === user.userId;

  if (!isAdmin && !isManager && !isOwner) {
    return NextResponse.json(
      {
        success: false,
        message: "You are not allowed to edit this company.",
      },
      { status: 403 }
    );
  }

  const body = await req.json();

  await updateCompany(id, body);

  return NextResponse.json({
    success: true,
  });
}

/* =========================================================
   DELETE COMPANY
========================================================= */

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
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

  const { id } = await params;

  const company = await getCompany(id);

  if (!company) {
    return NextResponse.json(
      {
        success: false,
        message: "Company not found",
      },
      { status: 404 }
    );
  }

  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "Manager";
  const isOwner = company.createdBy === user.userId;

  if (!isAdmin && !isManager && !isOwner) {
    return NextResponse.json(
      {
        success: false,
        message: "You are not allowed to delete this company.",
      },
      { status: 403 }
    );
  }

  await deleteCompany(id);

  return NextResponse.json({
    success: true,
  });
}