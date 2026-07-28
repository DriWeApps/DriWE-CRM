import { NextResponse } from "next/server";

import {
  getCustomerManagementDriverById,
  updateCustomerManagementDriver,
  deleteCustomerManagementDriver,
} from "@/services/customer-management-driver.service";

import {
  getUserFromRequest,
  isAdminUser,
} from "@/lib/auth";

interface Params {
  params: Promise<{
    customerId: string;
  }>;
}

/* =========================================================
   GET SINGLE DRIVER
========================================================= */

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

    const { customerId } = await params;

    const driver =
      await getCustomerManagementDriverById(customerId);

    if (!driver) {
      return NextResponse.json(
        {
          success: false,
          message: "Driver not found",
        },
        { status: 404 }
      );
    }

    const isAdmin = isAdminUser(user);
    const isManager = user.role === "Manager";

    const isOwner =
      driver.createdBy === user.userId ||
      driver.createdByEmail === user.email;

    /*
     * Admin and Manager can view anyone.
     * Employee can view only their own driver.
     */
    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to view this driver",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      driver,
    });
  } catch (error) {
    console.error(
      "GET Customer Management Driver Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch driver",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT / UPDATE DRIVER

   Admin    -> can edit anyone
   Manager  -> can edit anyone
   Employee -> can edit only their own
========================================================= */

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

    const { customerId } = await params;

    const existingDriver =
      await getCustomerManagementDriverById(customerId);

    if (!existingDriver) {
      return NextResponse.json(
        {
          success: false,
          message: "Driver not found",
        },
        { status: 404 }
      );
    }

    const isAdmin = isAdminUser(user);
    const isManager = user.role === "Manager";

    const isOwner =
      existingDriver.createdBy === user.userId ||
      existingDriver.createdByEmail === user.email;

    /*
     * Permission check
     */
    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only edit drivers added by you",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      name,
      email,
      contactNo,
      status,
      reason,
      date,
    } = body;

    /* =====================================================
       VALIDATE STATUS
    ===================================================== */

    const allowedStatuses = [
      "Accept",
      "Reject",
      "Hold",
    ];

    const finalStatus = status ?? existingDriver.status;

    if (!allowedStatuses.includes(finalStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Allowed values are Accept, Reject and Hold",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       REASON REQUIRED FOR REJECT / HOLD
    ===================================================== */

    const finalReason =
      reason !== undefined
        ? String(reason).trim()
        : existingDriver.reason || "";

    if (
      (finalStatus === "Reject" ||
        finalStatus === "Hold") &&
      !finalReason
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reason is required when status is Reject or Hold",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       UPDATE DATA
    ===================================================== */

    const updatedDriver =
      await updateCustomerManagementDriver(
        customerId,
        {
          name:
            name !== undefined
              ? String(name).trim()
              : existingDriver.name,

          email:
            email !== undefined
              ? String(email).trim().toLowerCase()
              : existingDriver.email,

          contactNo:
            contactNo !== undefined
              ? String(contactNo).trim()
              : existingDriver.contactNo,

          status: finalStatus,

          reason: finalReason,

          date:
            date !== undefined
              ? String(date)
              : existingDriver.date,
        }
      );

    return NextResponse.json({
      success: true,
      message: "Driver updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error(
      "PUT Customer Management Driver Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update driver",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE DRIVER

   Admin    -> can delete anyone
   Manager  -> can delete anyone
   Employee -> can delete only their own
========================================================= */

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

    const { customerId } = await params;

    const existingDriver =
      await getCustomerManagementDriverById(customerId);

    if (!existingDriver) {
      return NextResponse.json(
        {
          success: false,
          message: "Driver not found",
        },
        { status: 404 }
      );
    }

    const isAdmin = isAdminUser(user);
    const isManager = user.role === "Manager";

    const isOwner =
      existingDriver.createdBy === user.userId ||
      existingDriver.createdByEmail === user.email;

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only delete drivers added by you",
        },
        { status: 403 }
      );
    }

    await deleteCustomerManagementDriver(customerId);

    return NextResponse.json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE Customer Management Driver Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete driver",
      },
      { status: 500 }
    );
  }
}