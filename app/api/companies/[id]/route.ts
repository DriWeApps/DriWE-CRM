import { NextResponse } from "next/server";

import {
  deleteCompany,
  getCompany,
  updateCompany,
} from "@/services/company.service";

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

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  await deleteCompany(id);

  return NextResponse.json({
    success: true,
  });
}