import { NextResponse } from "next/server";
import {
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE_NAME = "CRM_FollowUps";


// GET ALL FOLLOWUPS

export async function GET() {

  try {

    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );


    return NextResponse.json({

      success:true,

      followups: result.Items || []

    });


  } catch(error) {

    console.error("GET Followups Error:",error);


    return NextResponse.json(
      {
        success:false,
        message:"Failed to fetch followups"
      },
      {
        status:500
      }
    );

  }

}




// CREATE FOLLOWUP

export async function POST(req:Request){

  try{


    const body = await req.json();



    const {

      title,

      companyId,
      companyName,

      employeeId,
      employeeName,

      followupDate,

      priority,

      status,

      notes


    } = body;



    if(
      !title ||
      !companyId ||
      !employeeId ||
      !followupDate
    ){

      return NextResponse.json(
        {
          success:false,
          message:"Required fields missing"
        },
        {
          status:400
        }
      );

    }





   const followup = {

  followUpId: crypto.randomUUID(),

  title,


      companyId,

      companyName,


      employeeId,

      employeeName,


      followupDate,


      priority: priority || "Medium",


      status: status || "Pending",


      notes: notes || "",


      createdAt:new Date().toISOString()


    };




    await db.send(

      new PutCommand({

        TableName:TABLE_NAME,

        Item:followup

      })

    );




    return NextResponse.json({

      success:true,

      message:"Follow-up created successfully",

      followup

    });



  }catch(error){


    console.error("CREATE Followup Error:",error);



    return NextResponse.json(
      {
        success:false,
        message:"Failed to create followup"
      },
      {
        status:500
      }
    );


  }

}