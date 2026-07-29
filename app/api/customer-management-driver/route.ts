import { NextResponse } from "next/server";

import {
    createCustomerManagementDriver,
    getCustomerManagementDrivers,
    getCustomerManagementDriversByUser,
} from "@/services/customer-management-driver.service";

import {
    getUserFromRequest,
    isAdminUser,
} from "@/lib/auth";

import type {
    CustomerManagementDriverStatus,
} from "@/services/customer-management-driver.service";

/* =========================================================
   GET
   Admin / Manager  -> All drivers
   Employee         -> Own drivers only

   Filters:
   - date
   - fromDate
   - toDate
   - contactNo
   - email
========================================================= */

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

        const { searchParams } = new URL(req.url);

        const date = searchParams.get("date")?.trim() || "";
        const fromDate = searchParams.get("fromDate")?.trim() || "";
        const toDate = searchParams.get("toDate")?.trim() || "";
        const contactNo = searchParams.get("contactNo")?.trim() || "";
        const email = searchParams.get("email")?.trim() || "";

        const isAdmin = isAdminUser(user);
        const isManager = user.role === "Manager";

        /*
         * Admin and Manager can see everyone's drivers.
         * Employees can see only drivers created by themselves.
         */
        let drivers;

        if (isAdmin || isManager) {
            drivers = await getCustomerManagementDrivers();
        } else {
            drivers = await getCustomerManagementDriversByUser(
                user.userId,
                user.email
            );
        }

        /* =====================================================
           FILTERS
        ===================================================== */

        const filteredDrivers = drivers.filter((driver) => {
            /*
             * Exact date filter
             */
            if (date && driver.date !== date) {
                return false;
            }

            /*
             * From date
             */
            if (fromDate && driver.date < fromDate) {
                return false;
            }

            /*
             * To date
             */
            if (toDate && driver.date > toDate) {
                return false;
            }

            /*
             * Contact number
             * Partial matching is supported.
             *
             * Example:
             * 987
             * will find:
             * 9876543210
             * 9987654321
             */
            if (
                contactNo &&
                !driver.contactNo
                    .toLowerCase()
                    .includes(contactNo.toLowerCase())
            ) {
                return false;
            }

            /*
             * Email
             * Partial matching is supported.
             */
            if (
                email &&
                !driver.email
                    .toLowerCase()
                    .includes(email.toLowerCase())
            ) {
                return false;
            }

            return true;
        });

        /*
         * Newest date first
         */
        filteredDrivers.sort((a, b) => {
            return b.date.localeCompare(a.date);
        });

        return NextResponse.json({
            success: true,
            drivers: filteredDrivers,
            total: filteredDrivers.length,
        });
    } catch (error) {
        console.error(
            "GET Customer Management Driver Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch drivers",
            },
            { status: 500 }
        );
    }
}

/* =========================================================
   POST
   Create Driver
========================================================= */

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
    name,
    email,
    contactNo,
    status,
    reason,
    date,
    type,
} = body;

        /* =====================================================
           BASIC VALIDATION
        ===================================================== */

        if (
            !name?.trim() ||
            !email?.trim() ||
            !contactNo?.trim() ||
            !status ||
            !date
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Name, email, contact number, status and date are required",
                },
                { status: 400 }
            );
        }

        const allowedTypes = ["Cab", "Courier"];

if (!type || !allowedTypes.includes(type)) {
    return NextResponse.json(
        {
            success: false,
            message: "Type is required. Allowed values are Cab and Courier",
        },
        { status: 400 }
    );
}

        /* =====================================================
           STATUS VALIDATION
        ===================================================== */

        const allowedStatuses: CustomerManagementDriverStatus[] = [
            "Accept",
            "Reject",
            "Hold",
        ];

        if (!allowedStatuses.includes(status)) {
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
           REASON VALIDATION
           Reject / Hold -> Reason required
        ===================================================== */

        if (
            (status === "Reject" || status === "Hold") &&
            !reason?.trim()
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

        const existingDrivers = await getCustomerManagementDrivers();

const maxSrNo = existingDrivers.reduce((max, driver) => {
    return Math.max(max, Number(driver.srNo) || 0);
}, 0);

const nextSrNo = maxSrNo + 1;

const now = new Date().toISOString();


        // const now = new Date().toISOString();

        const driver = {
            customerId: crypto.randomUUID(),

             srNo: nextSrNo,

            name: name.trim(),
            email: email.trim().toLowerCase(),
            contactNo: contactNo.trim(),

             type,

            status,
            reason: reason?.trim() || "",

            date,

            /*
             * Creator information
             */
            createdBy: user.userId,
            createdByName:
                // user.name ||
                user.email ||
                "Unknown User",
            createdByEmail: user.email,

            createdAt: now,
            updatedAt: now,
        };

        const createdDriver =
            await createCustomerManagementDriver(driver);

        return NextResponse.json(
            {
                success: true,
                message: "Driver added successfully",
                driver: createdDriver,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "POST Customer Management Driver Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create driver",
            },
            { status: 500 }
        );
    }
}