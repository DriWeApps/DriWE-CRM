"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";


interface Followup {

  followUpId: string;

  title: string;

  companyName: string;

  employeeName: string;

  followupDate: string;

  priority: string;

  status: string;

}



export default function Followups() {


  const [followups, setFollowups] = useState<Followup[]>([]);

  const [loading, setLoading] = useState(true);



  async function fetchFollowups() {

    try {

      const res = await fetch("/api/followups");

      const data = await res.json();


      if (data.success) {

        setFollowups(data.followups);

      }


    } catch (error) {

      console.log(error);

    }
    finally {

      setLoading(false);

    }

  }




  useEffect(() => {

    fetchFollowups();

  }, []);





  return (

    <div className="p-6 space-y-6">


      {/* Header */}

      <div className="flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold text-white">
            Follow-ups
          </h1>

          <p className="text-slate-400">
            Manage customer follow-up activities
          </p>

        </div>



        <Link

          href="/followups/add"

          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 hover:bg-cyan-400"

        >

          <Plus size={18} />

          Add Follow-up

        </Link>


      </div>





      {/* Stats */}

      <div className="grid gap-4 md:grid-cols-4">


        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

          <CalendarDays className="text-cyan-400" />

          <h2 className="mt-3 text-2xl font-bold text-white">
            {followups.length}
          </h2>

          <p className="text-slate-400">
            Total Follow-ups
          </p>

        </div>





        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

          <Clock className="text-yellow-400" />

          <h2 className="mt-3 text-2xl font-bold text-white">

            {
              followups.filter(
                f => f.status === "Pending"
              ).length
            }

          </h2>


          <p className="text-slate-400">
            Pending
          </p>


        </div>






        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

          <CheckCircle className="text-green-400" />


          <h2 className="mt-3 text-2xl font-bold text-white">

            {
              followups.filter(
                f => f.status === "Completed"
              ).length
            }

          </h2>


          <p className="text-slate-400">
            Completed
          </p>


        </div>





        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

          <AlertCircle className="text-red-400" />


          <h2 className="mt-3 text-2xl font-bold text-white">

            {
              followups.filter(
                f => f.priority === "High"
              ).length
            }

          </h2>


          <p className="text-slate-400">
            High Priority
          </p>


        </div>


      </div>






      {/* Table */}


      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">


        <table className="w-full">


          <thead className="border-b border-slate-800">


            <tr className="text-left text-sm text-slate-400">


              <th className="p-4">
                Follow-up
              </th>


              <th className="p-4">
                Company
              </th>


              <th className="p-4">
                Employee
              </th>


              <th className="p-4">
                Date
              </th>


              <th className="p-4">
                Priority
              </th>


              <th className="p-4">
                Status
              </th>


            </tr>


          </thead>





          <tbody>


            {
              loading ? (

                <tr>

                  <td className="p-5 text-slate-400">

                    Loading follow-ups...

                  </td>

                </tr>


              ) : followups.length === 0 ? (


                <tr>

                  <td className="p-5 text-slate-400">

                    No follow-ups created yet

                  </td>

                </tr>



              ) : (


                followups.map((followup) => (


                  <tr

                    key={followup.followUpId}

                    className="border-b border-slate-800 text-white hover:bg-slate-900"

                  >


                    <td className="p-4">

                      {followup.title}

                    </td>



                    <td className="p-4 text-slate-300">

                      {followup.companyName}

                    </td>



                    <td className="p-4">

                      {followup.employeeName}

                    </td>




                    <td className="p-4">

                      {followup.followupDate}

                    </td>




                    <td className="p-4">

                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">

                        {followup.priority}

                      </span>

                    </td>




                    <td className="p-4">

                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">

                        {followup.status}

                      </span>

                    </td>



                  </tr>


                ))


              )
            }


          </tbody>


        </table>


      </div>



    </div>

  );

}