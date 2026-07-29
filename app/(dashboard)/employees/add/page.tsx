// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//     ArrowLeft,
//     Save,
//     UserPlus,
// } from "lucide-react";

// export default function AddEmployeePage() {
//     const router = useRouter();

//     const [loading, setLoading] = useState(false);

//     const [form, setForm] = useState({
//         firstName: "",
//         lastName: "",
//         email: "",
//         loginEmail: "",
//         password: "",
//         mobile: "",

//         designation: "",
//         department: "",
//         role: "Executive",
//         status: "Active",

//         joiningDate: "",
//         dateOfBirth: "",
//         gender: "",

//         address: "",
//         city: "",
//         state: "",
//         pincode: "",
//         country: "",
//     });

//     function handleChange(
//         e: React.ChangeEvent<
//             HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//         >
//     ) {
//         const { name, value } = e.target;

//         setForm((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     }

//     async function handleSubmit(
//         e: React.FormEvent<HTMLFormElement>
//     ) {
//         e.preventDefault();

//         setLoading(true);

//         try {
//             const res = await fetch("/api/employees", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 credentials: "include",
//                 body: JSON.stringify(form),
//             });

//             const data = await res.json();

//             if (!res.ok || !data.success) {
//                 alert(data.message || "Failed to create employee");
//                 return;
//             }

//             alert("Employee created successfully.");

//             router.push("/employees");
//             router.refresh();
//         } catch (error) {
//             console.error("Create employee error:", error);
//             alert("Something went wrong while creating employee.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className="min-h-screen bg-zinc-950 px-6 py-8">
//             <div className="mx-auto max-w-5xl">

//                 {/* Header */}
//                 <div className="mb-8 flex items-center gap-4">

//                     <Link
//                         href="/employees"
//                         className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-white transition hover:bg-slate-800"
//                     >
//                         <ArrowLeft size={20} />
//                     </Link>

//                     <div>
//                         <div className="flex items-center gap-3">
//                             <UserPlus className="text-cyan-400" size={28} />

//                             <h1 className="text-3xl font-bold text-white">
//                                 Add New Employee
//                             </h1>
//                         </div>

//                         <p className="mt-1 text-slate-400">
//                             Add employee information and login details
//                         </p>
//                     </div>

//                 </div>

//                 {/* Form */}
//                 <form
//                     onSubmit={handleSubmit}
//                     className="space-y-8 rounded-3xl border border-slate-800 bg-zinc-900 p-6 md:p-8"
//                 >

//                     {/* ================= PERSONAL DETAILS ================= */}

//                     <section>

//                         <h2 className="mb-5 text-xl font-semibold text-white">
//                             Personal Details
//                         </h2>

//                         <div className="grid gap-5 md:grid-cols-2">

//                             {/* First Name */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     First Name *
//                                 </label>

//                                 <input
//                                     required
//                                     type="text"
//                                     name="firstName"
//                                     value={form.firstName}
//                                     onChange={handleChange}
//                                     placeholder="Enter first name"
//                                     className="input"
//                                 />
//                             </div>

//                             {/* Last Name */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Last Name *
//                                 </label>

//                                 <input
//                                     required
//                                     type="text"
//                                     name="lastName"
//                                     value={form.lastName}
//                                     onChange={handleChange}
//                                     placeholder="Enter last name"
//                                     className="input"
//                                 />
//                             </div>

//                             {/* Email */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Email *
//                                 </label>

//                                 <input
//                                     required
//                                     type="email"
//                                     name="email"
//                                     value={form.email}
//                                     onChange={handleChange}
//                                     placeholder="employee@example.com"
//                                     className="input"
//                                 />
//                             </div>

//                             {/* Mobile */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Mobile Number *
//                                 </label>

//                                 <input
//                                     required
//                                     type="tel"
//                                     name="mobile"
//                                     value={form.mobile}
//                                     onChange={handleChange}
//                                     placeholder="Enter mobile number"
//                                     className="input"
//                                 />
//                             </div>

//                             {/* DOB */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Date of Birth *
//                                 </label>

//                                 <input
//                                     required
//                                     type="date"
//                                     name="dateOfBirth"
//                                     value={form.dateOfBirth}
//                                     onChange={handleChange}
//                                     className="input"
//                                 />
//                             </div>

//                             {/* Gender */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Gender
//                                 </label>

//                                 <select
//                                     name="gender"
//                                     value={form.gender}
//                                     onChange={handleChange}
//                                     className="input"
//                                 >
//                                     <option value="">Select Gender</option>
//                                     <option value="Male">Male</option>
//                                     <option value="Female">Female</option>
//                                     <option value="Other">Other</option>
//                                 </select>
//                             </div>

//                         </div>

//                     </section>

//                     {/* ================= JOB DETAILS ================= */}

//                     <section>

//                         <h2 className="mb-5 text-xl font-semibold text-white">
//                             Job Details
//                         </h2>

//                         <div className="grid gap-5 md:grid-cols-2">

//                             {/* Designation */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Designation *
//                                 </label>

//                                 <select
//                                     required
//                                     name="designation"
//                                     value={form.designation}
//                                     onChange={handleChange}
//                                     className="input"
//                                 >
//                                     <option value="">Select Designation</option>

//                                     <option value="Development Manager">
//                                         Development Manager
//                                     </option>

//                                     <option value="Document Verification">
//                                         Document Verification
//                                     </option>

//                                     <option value="Intern Part-Time">
//                                         Intern Part-Time
//                                     </option>

//                                     <option value="Sales Intern">
//                                         Sales Intern
//                                     </option>

//                                     <option value="Admin desk">
//                                         Admin desk
//                                     </option>

//                                     <option value="Software Developer">
//                                         Software Developer
//                                     </option>

//                                     <option value="Sales Executive">
//                                         Sales Executive
//                                     </option>

//                                     <option value="HR">
//                                         HR
//                                     </option>

//                                     <option value="Other">
//                                         Other
//                                     </option>
//                                 </select>
//                             </div>

//                             {/* Department */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Department
//                                 </label>

//                                 <select
//                                     name="department"
//                                     value={form.department}
//                                     onChange={handleChange}
//                                     className="input"
//                                 >
//                                     <option value="">Select Department</option>
//                                     <option value="Engineering & Marketing">
//                                         Engineering & Marketing
//                                     </option>
//                                     <option value="Sales">
//                                         Sales
//                                     </option>
//                                     <option value="HR">
//                                         HR
//                                     </option>
//                                     <option value="Operations">
//                                         Operations
//                                     </option>
//                                     <option value="Finance">
//                                         Finance
//                                     </option>
//                                     <option value="Administration">
//                                         Administration
//                                     </option>
//                                 </select>
//                             </div>

//                             {/* Role */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Role *
//                                 </label>

//                                 <select
//                                     required
//                                     name="role"
//                                     value={form.role}
//                                     onChange={handleChange}
//                                     className="input"
//                                 >
//                                     <option value="Executive">
//                                         Executive
//                                     </option>

//                                     <option value="Manager">
//                                         Manager
//                                     </option>

//                                     <option value="Admin">
//                                         Admin
//                                     </option>
//                                 </select>
//                             </div>

//                             {/* Status */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Status
//                                 </label>

//                                 <select
//                                     name="status"
//                                     value={form.status}
//                                     onChange={handleChange}
//                                     className="input"
//                                 >
//                                     <option value="Active">
//                                         Active
//                                     </option>

//                                     <option value="Inactive">
//                                         Inactive
//                                     </option>
//                                 </select>
//                             </div>

//                             {/* Joining Date */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Joining Date
//                                 </label>

//                                 <input
//                                     type="date"
//                                     name="joiningDate"
//                                     value={form.joiningDate}
//                                     onChange={handleChange}
//                                     className="input"
//                                 />
//                             </div>

//                         </div>

//                     </section>

//                     {/* ================= LOGIN DETAILS ================= */}

//                     <section>

//                         <h2 className="mb-5 text-xl font-semibold text-white">
//                             Login Details
//                         </h2>

//                         <div className="grid gap-5 md:grid-cols-2">

//                             {/* Login Email */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Login Email *
//                                 </label>

//                                 <input
//                                     required
//                                     type="email"
//                                     name="loginEmail"
//                                     value={form.loginEmail}
//                                     onChange={handleChange}
//                                     placeholder="Login email"
//                                     className="input"
//                                 />

//                                 <p className="mt-1 text-xs text-slate-500">
//                                     This email will be used to login.
//                                 </p>
//                             </div>

//                             {/* Password */}
//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Login Password *
//                                 </label>

//                                 <input
//                                     required
//                                     minLength={6}
//                                     type="password"
//                                     name="password"
//                                     value={form.password}
//                                     onChange={handleChange}
//                                     placeholder="Minimum 6 characters"
//                                     className="input"
//                                 />
//                             </div>

//                         </div>

//                     </section>

//                     {/* ================= ADDRESS ================= */}

//                     <section>

//                         <h2 className="mb-5 text-xl font-semibold text-white">
//                             Address
//                         </h2>

//                         <div className="space-y-5">

//                             <div>
//                                 <label className="mb-2 block text-sm text-slate-300">
//                                     Address
//                                 </label>

//                                 <textarea
//                                     name="address"
//                                     value={form.address}
//                                     onChange={handleChange}
//                                     rows={3}
//                                     placeholder="Enter address"
//                                     className="input resize-none"
//                                 />
//                             </div>

//                             <div className="grid gap-5 md:grid-cols-2">

//                                 <div>
//                                     <label className="mb-2 block text-sm text-slate-300">
//                                         City
//                                     </label>

//                                     <input
//                                         type="text"
//                                         name="city"
//                                         value={form.city}
//                                         onChange={handleChange}
//                                         placeholder="City"
//                                         className="input"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="mb-2 block text-sm text-slate-300">
//                                         State
//                                     </label>

//                                     <input
//                                         type="text"
//                                         name="state"
//                                         value={form.state}
//                                         onChange={handleChange}
//                                         placeholder="State"
//                                         className="input"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="mb-2 block text-sm text-slate-300">
//                                         Pincode
//                                     </label>

//                                     <input
//                                         type="text"
//                                         name="pincode"
//                                         value={form.pincode}
//                                         onChange={handleChange}
//                                         placeholder="Pincode"
//                                         className="input"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="mb-2 block text-sm text-slate-300">
//                                         Country
//                                     </label>

//                                     <input
//                                         type="text"
//                                         name="country"
//                                         value={form.country}
//                                         onChange={handleChange}
//                                         placeholder="Country"
//                                         className="input"
//                                     />
//                                 </div>

//                             </div>

//                         </div>

//                     </section>

//                     {/* Buttons */}

//                     <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">

//                         <Link
//                             href="/employees"
//                             className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
//                         >
//                             Cancel
//                         </Link>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             <Save size={18} />

//                             {loading ? "Creating..." : "Create Employee"}
//                         </button>

//                     </div>

//                 </form>

//             </div>

//             {/* Tailwind helper */}
//             <style jsx>{`
//         .input {
//           width: 100%;
//           border-radius: 0.75rem;
//           border: 1px solid rgb(51 65 85);
//           background: rgb(9 9 11);
//           padding: 0.75rem 1rem;
//           color: white;
//           outline: none;
//         }

//         .input:focus {
//           border-color: rgb(6 182 212);
//         }

//         .input::placeholder {
//           color: rgb(100 116 139);
//         }
//       `}</style>
//         </div>
//     );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    UserPlus,
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    MapPin,
    Shield,
} from "lucide-react";

export default function AddEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        loginEmail: "",
        password: "",
        mobile: "",
        designation: "",
        department: "",
        role: "Executive",
        status: "Active",
        joiningDate: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
    });

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to create employee");
                return;
            }

            alert("Employee created successfully.");
            router.push("/employees");
            router.refresh();
        } catch (error) {
            console.error("Create employee error:", error);
            alert("Something went wrong while creating employee.");
        } finally {
            setLoading(false);
        }
    }

    const fullName =
        [form.firstName, form.lastName].filter(Boolean).join(" ") || "New Employee";

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/employees"
                        className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-white transition hover:bg-slate-800"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>
                        <div className="flex items-center gap-3">
                            <UserPlus className="text-cyan-400" size={28} />
                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                Add New Employee
                            </h1>
                        </div>
                        <p className="mt-1 text-slate-400">
                            Fill the form — preview updates live on the right
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* ===================== FORM ===================== */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8 rounded-3xl border border-slate-800 bg-zinc-900 p-6 lg:col-span-3 md:p-8"
                    >
                        {/* PERSONAL DETAILS */}
                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <User size={20} className="text-cyan-400" />
                                Personal Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        First Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="e.g. Rahul"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Last Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="e.g. Sharma"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Email *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="employee@example.com"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Mobile Number *
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        name="mobile"
                                        value={form.mobile}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Date of Birth *
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        name="dateOfBirth"
                                        value={form.dateOfBirth}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* JOB DETAILS */}
                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <Briefcase size={20} className="text-cyan-400" />
                                Job Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Designation *
                                    </label>
                                    <select
                                        required
                                        name="designation"
                                        value={form.designation}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select Designation</option>
                                        <option value="Development Manager">Development Manager</option>
                                        <option value="Document Verification">Document Verification</option>
                                        <option value="Intern Part-Time">Intern Part-Time</option>
                                        <option value="Sales Intern">Sales Intern</option>
                                        <option value="Admin desk">Admin desk</option>
                                        <option value="Software Developer">Software Developer</option>
                                        <option value="Sales Executive">Sales Executive</option>
                                        <option value="HR">HR</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering & Marketing">Engineering & Marketing</option>
                                        <option value="Sales">Sales</option>
                                        <option value="HR">HR</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Administration">Administration</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Role *
                                    </label>
                                    <select
                                        required
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="Executive">Executive</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={form.joiningDate}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* LOGIN DETAILS */}
                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <Shield size={20} className="text-cyan-400" />
                                Login Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Login Email *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="loginEmail"
                                        value={form.loginEmail}
                                        onChange={handleChange}
                                        placeholder="login@company.com"
                                        className="input"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        This email will be used to login
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Login Password *
                                    </label>
                                    <input
                                        required
                                        minLength={6}
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 6 characters"
                                        className="input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ADDRESS */}
                        <section>
                            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
                                <MapPin size={20} className="text-cyan-400" />
                                Address
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Full Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="House no, street, landmark..."
                                        className="input resize-none"
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={form.state}
                                            onChange={handleChange}
                                            placeholder="State"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={form.pincode}
                                            onChange={handleChange}
                                            placeholder="Pincode"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm text-slate-300">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={form.country}
                                            onChange={handleChange}
                                            placeholder="Country"
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">
                            <Link
                                href="/employees"
                                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? "Creating..." : "Create Employee"}
                            </button>
                        </div>
                    </form>

                    {/* ===================== LIVE PREVIEW ===================== */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-6">
                            <div className="rounded-3xl border border-slate-800 bg-zinc-900 p-6 shadow-xl">
                                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Live Preview
                                </p>

                                {/* Avatar + Name */}
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-bold text-white">
                                        {form.firstName
                                            ? form.firstName.charAt(0).toUpperCase()
                                            : "?"}
                                        {form.lastName
                                            ? form.lastName.charAt(0).toUpperCase()
                                            : ""}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white">{fullName}</h3>
                                        <p className="text-sm text-cyan-400">
                                            {form.designation || "Designation"}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mb-5">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${form.status === "Active"
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : "bg-rose-500/15 text-rose-400"
                                            }`}
                                    >
                                        {form.status}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Briefcase size={16} className="mt-0.5 text-slate-500" />
                                        <div>
                                            <p className="text-slate-500">Department & Role</p>
                                            <p className="text-white">
                                                {form.department || "—"} • {form.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar size={16} className="mt-0.5 text-slate-500" />
                                        <div>
                                            <p className="text-slate-500">Date of Birth</p>
                                            <p className="text-white">
                                                {form.dateOfBirth
                                                    ? new Date(form.dateOfBirth).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar size={16} className="mt-0.5 text-slate-500" />
                                        <div>
                                            <p className="text-slate-500">Joining Date</p>
                                            <p className="text-white">
                                                {form.joiningDate
                                                    ? new Date(form.joiningDate).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Mail size={16} className="mt-0.5 text-slate-500" />
                                        <div>
                                            <p className="text-slate-500">Email</p>
                                            <p className="text-white break-all">
                                                {form.email || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone size={16} className="mt-0.5 text-slate-500" />
                                        <div>
                                            <p className="text-slate-500">Mobile</p>
                                            <p className="text-white">{form.mobile || "—"}</p>
                                        </div>
                                    </div>

                                    {(form.address || form.city || form.state) && (
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="mt-0.5 text-slate-500" />
                                            <div>
                                                <p className="text-slate-500">Address</p>
                                                <p className="text-white">
                                                    {[form.address, form.city, form.state, form.pincode]
                                                        .filter(Boolean)
                                                        .join(", ") || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shared input styles */}
            <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(51 65 85);
          background: rgb(9 9 11);
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .input:focus {
          border-color: rgb(6 182 212);
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.15);
        }

        .input::placeholder {
          color: rgb(100 116 139);
        }
      `}</style>
        </div>
    );
}