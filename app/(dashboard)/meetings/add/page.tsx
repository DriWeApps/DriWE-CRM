"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";


interface Company {
    companyId: string;
    companyName: string;
}


interface Employee {
    employeeId: string;
    firstName: string;
    lastName: string;
    designation?: string;
}



export default function AddMeetingPage() {

    const router = useRouter();


    const [companies, setCompanies] = useState<Company[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [loading, setLoading] = useState(false);


    const [form, setForm] = useState({

        title: "",

        companyId: "",
        companyName: "DriWE Smartech Pvt. Ltd.",

        employeeId: "",
        employeeName: "",

        date: new Date().toISOString().split("T")[0],

        time: "",

        status: "Scheduled",

        description: ""

    });



    useEffect(() => {

        fetchCompanies();
        fetchEmployees();

    }, []);



    async function fetchCompanies() {

        try {

            const res = await fetch("/api/companies");

            const data = await res.json();

            if (data.success) {

                const defaultCompany = {
                    companyId: data.companies.find(
                        (c: Company) => c.companyName === "DriWE Smartech Pvt. Ltd."
                    )?.companyId || "driwe-default"
                    // companyName: "DriWE Smartech Pvt. Ltd."
                };


                setCompanies([
                    defaultCompany,
                    ...data.companies
                ]);


                setForm(prev => ({
                    ...prev,
                    companyId: "driwe-default",
                    companyName: "DriWE Smartech Pvt. Ltd."
                }));

            }

        } catch (error) {

            console.log(error);

        }

    }




 async function fetchEmployees() {

    try {

        const res = await fetch("/api/employees");

        const data = await res.json();

        setEmployees(data);

    } catch (error) {

        console.log(error);

    }

}




    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    }





    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        setLoading(true);


        try {


            const res = await fetch("/api/meetings", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(form)

            });



            const data = await res.json();



            if (data.success) {

                router.push("/meetings");

            } else {

                alert(data.message);

            }



        } catch (error) {

            console.log(error);

            alert("Something went wrong");

        }
        finally {

            setLoading(false);

        }

    }





    return (

        <div className="p-6 max-w-3xl">


            {/* Header */}

            <div className="flex items-center gap-3 mb-6">

                <Link
                    href="/meetings"
                    className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-800"
                >
                    <ArrowLeft size={18} />
                </Link>


                <div>

                    <h1 className="text-3xl font-bold text-white">
                        Schedule Meeting
                    </h1>

                    <p className="text-slate-400">
                        Create a new company meeting
                    </p>

                </div>

            </div>





            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border border-slate-800 bg-slate-950 p-6"
            >


                {/* Title */}

                {/* Title */}

                <div>

                    <label className="text-sm text-slate-300">
                        Meeting Title
                    </label>

                    <input

                        type="text"

                        name="title"

                        value={form.title}

                        onChange={handleChange}

                        placeholder="Client Discussion"

                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"

                        required

                    />

                </div>





                {/* Company */}

                <div>

                    <label className="text-sm text-slate-300">
                        Company
                    </label>


                    <select

                        name="companyId"

                        value={form.companyId}

                        onChange={(e) => {

                            const company =
                                companies.find(
                                    c => c.companyId === e.target.value
                                );


                            setForm({

                                ...form,

                                companyId: e.target.value,

                                companyName: company?.companyName || ""

                            });


                        }}

                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"

                        required

                    >

                        <option value="">
                            Select Company
                        </option>


                        {
                            companies.map(company => (

                                <option
                                    key={company.companyId}
                                    value={company.companyId}
                                >
                                    {company.companyName}
                                </option>

                            ))
                        }


                    </select>

                </div>






                {/* Employee */}

                <div>

                    <label className="text-sm text-slate-300">
                        Assign Employee
                    </label>


                    <select

                        name="employeeId"

                        value={form.employeeId}

                        onChange={(e) => {


                            const employee =
                                employees.find(
                                    emp => emp.employeeId === e.target.value
                                );


                            setForm({

                                ...form,

                                employeeId: e.target.value,

                                employeeName:
                                    `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim()

                            });


                        }}


                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"

                        required

                    >

                        <option value="">
                            Select Employee
                        </option>


                        {
                            employees.map(emp => (

                                <option
                                    key={emp.employeeId}
                                    value={emp.employeeId}
                                >
                                    {emp.firstName} {emp.lastName}
                                </option>

                            ))
                        }


                    </select>


                </div>






                <div className="grid md:grid-cols-2 gap-4">


                    <div>

                        <label className="text-sm text-slate-300">
                            Date
                        </label>


                        <div className="relative">

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white cursor-pointer"
                                required
                            />

                        </div>
                    </div>





                    <div>

                        <label className="text-sm text-slate-300">
                            Time
                        </label>


                        <input
                            type="time"
                            name="time"
                            value={form.time}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white cursor-pointer"
                            required
                        />

                    </div>


                </div>







                {/* Status */}

                <div>

                    <label className="text-sm text-slate-300">
                        Status
                    </label>


                    <select

                        name="status"

                        value={form.status}

                        onChange={handleChange}

                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"

                    >

                        <option>
                            Scheduled
                        </option>

                        <option>
                            Completed
                        </option>

                        <option>
                            Cancelled
                        </option>


                    </select>

                </div>






                {/* Description */}

                <div>

                    <label className="text-sm text-slate-300">
                        Description
                    </label>


                    <textarea

                        name="description"

                        value={form.description}

                        onChange={handleChange}

                        rows={4}

                        placeholder="Meeting notes..."

                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"

                    />

                </div>







                <button

                    disabled={loading}

                    className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50"

                >

                    <Save size={18} />

                    {
                        loading
                            ? "Saving..."
                            : "Schedule Meeting"
                    }


                </button>



            </form>


        </div>

    );

}