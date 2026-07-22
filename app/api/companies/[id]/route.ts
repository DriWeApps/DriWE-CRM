// import { NextResponse } from "next/server";

// import {
//   deleteCompany,
//   getCompany,
//   updateCompany,
// } from "@/services/company.service";

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

// export async function DELETE(req: Request, { params }: RouteContext) {
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

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const company = await getCompany(id);

  return NextResponse.json({
    success: true,
    company,
  });
}

export async function PUT(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json();

  await updateCompany(id, body);

  return NextResponse.json({
    success: true,
  });
}

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
      {
        status: 401,
      }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        message: "Only admin can delete companies",
      },
      {
        status: 403,
      }
    );
  }

  const { id } = await params;

  await deleteCompany(id);

  return NextResponse.json({
    success: true,
  });
}