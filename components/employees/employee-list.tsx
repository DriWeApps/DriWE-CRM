// 'use client';

// import React, { useEffect, useState } from "react";
// import { Plus, Loader2, Trash2, UserCog, Search, Mail, Phone } from "lucide-react";


// interface Employee {
//   employeeId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   mobile: string;
//   designation: string;
//   department: string;
//   // role: string;
//   status: string;
//   joiningDate: string;
//   dateOfBirth?: string;
//   gender?: string;
//   address?: string;
//   city?: string;
//   state?: string;
//   pincode?: string;
// }

// interface EmployeeListProps {
//   searchTerm?: string;
// }

// export default function EmployeeList({ searchTerm = "" }: EmployeeListProps) {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changingPassword, setChangingPassword] = useState(false);

//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     mobile: "",
//     designation: "",
//     department: "",
//     role: "Executive",
//     status: "Active",

//     joiningDate: "",
//     dateOfBirth: "",
//     gender: "",

//     address: "",
//     city: "",
//     state: "",
//     pincode: "",
//     country: "",
//   });
//   async function fetchEmployees() {
//     try {
//       const res = await fetch("/api/employees");
//       const data = await res.json();
//       setEmployees(Array.isArray(data) ? data : data.employees || []);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     async function loadUser() {
//       try {
//         const res = await fetch("/api/auth/me");
//         const data = await res.json();
//         const role = data.user?.role?.toString().toLowerCase();
//         setIsAdmin(role === "admin");
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     loadUser();
//   }, []);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!isAdmin) {
//       alert("Only admins can add employees.");
//       return;
//     }

//     if (!form.password.trim()) {
//       alert("Please enter a password for the employee login.");
//       return;
//     }

//     const res = await fetch("/api/employees", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });

//     if (res.ok) {
//       setForm({
//         firstName: "", lastName: "", email: "", password: "", mobile: "", designation: "",
//         department: "", role: "Executive", status: "Active", joiningDate: "",
//         dateOfBirth: "", gender: "",
//         address: "", city: "", state: "", pincode: "", country: "",
//       });
//       fetchEmployees();
//     } else {
//       const data = await res.json();
//       alert(data.message || "Unable to create employee");
//     }
//   }

//   async function handleDelete(employeeId: string) {
//     if (!isAdmin) {
//       alert("Only admins can delete employees.");
//       return;
//     }
//     if (!confirm("Delete this employee?")) return;

//     const res = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
//     if (res.ok) fetchEmployees();
//     else {
//       const data = await res.json();
//       alert(data.message || "Unable to delete employee");
//     }
//   }

//   async function handleResetPassword() {
//     if (newPassword.trim().length < 6) {
//       alert("Password must be at least 6 characters.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       alert("Passwords do not match.");
//       return;
//     }

//     try {
//       setChangingPassword(true);

//       const res = await fetch(
//         `/api/employees/${selectedEmployeeId}/password`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             password: newPassword,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!data.success) {
//         alert(data.message);
//         return;
//       }

//       alert("Password updated successfully.");

//       setShowPasswordModal(false);
//       setSelectedEmployeeId("");
//       setNewPassword("");
//       setConfirmPassword("");

//     } catch (error) {
//       console.error(error);
//       alert("Unable to update password.");
//     } finally {
//       setChangingPassword(false);
//     }
//   }
//   // Filter employees based on search term
//   const filteredEmployees = employees.filter((emp) =>
//     `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     emp.department.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-800 bg-zinc-900/50">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
//           <p className="text-slate-400">Loading team members...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] p-6">
//       {/* Left: Employee List */}
//       <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-6 shadow-xl">
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-semibold text-white">Team Roster</h2>
//             <p className="text-sm text-slate-400">Manage your active team members</p>
//           </div>
//           <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1 text-sm text-violet-300">
//             <UserCog className="h-4 w-4" />
//             {isAdmin ? "Admin Access" : "View Only"}
//           </div>
//         </div>

//         <div className="space-y-3">
//           {filteredEmployees.map((employee) => (
//             <div
//               key={employee.employeeId}
//               className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-zinc-950 p-5 hover:border-violet-500/30 transition-all"
//             >
//               <div className="flex-1">
//                 <div className="font-semibold text-white text-lg">
//                   {employee.firstName} {employee.lastName}
//                 </div>
//                 <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
//                   <a href={`mailto:${employee.email}`} className="flex items-center gap-1 hover:text-white">
//                     <Mail className="h-4 w-4" /> {employee.email}
//                   </a>
//                   {employee.mobile && (
//                     <a href={`tel:${employee.mobile}`} className="flex items-center gap-1 hover:text-white">
//                       <Phone className="h-4 w-4" /> {employee.mobile}
//                     </a>
//                   )}
//                 </div>
//                 <div className="mt-2 text-xs uppercase tracking-widest text-violet-400">
//                   {employee.designation} • {employee.department}
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <span
//                   className={`rounded-full px-4 py-1 text-xs font-medium ${employee.status === "Active"
//                     ? "bg-emerald-500/10 text-emerald-400"
//                     : "bg-red-500/10 text-red-400"
//                     }`}
//                 >
//                   {employee.status}
//                 </span>

//                 {isAdmin && (
//                   <>
//                     <button
//                       onClick={() => {
//                         setSelectedEmployeeId(employee.employeeId);
//                         setShowPasswordModal(true);
//                       }}
//                       className="rounded-xl p-3 opacity-0 group-hover:opacity-100 hover:bg-cyan-500/10 text-cyan-400 transition-all"
//                       title="Reset Password"
//                     >
//                       🔑
//                     </button>

//                     <button
//                       onClick={() => handleDelete(employee.employeeId)}
//                       className="rounded-xl p-3 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all"
//                       title="Delete Employee"
//                     >
//                       <Trash2 className="h-5 w-5" />
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}

//           {filteredEmployees.length === 0 && (
//             <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">
//               <p className="text-slate-400">
//                 {searchTerm ? "No matching employees found." : "No employees yet."}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Right: Add Employee Form */}
//       <form
//         onSubmit={handleSubmit}
//         className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-6 shadow-xl"
//       >
//         <div className="mb-6 flex items-center gap-3">
//           <Plus className="h-6 w-6 text-emerald-400" />
//           <h2 className="text-2xl font-semibold text-white">Add New Employee</h2>
//         </div>

//         <div className="grid gap-4 md:grid-cols-2">
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="First Name"
//             value={form.firstName}
//             onChange={(e) => setForm({ ...form, firstName: e.target.value })}
//             required
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Last Name"
//             value={form.lastName}
//             onChange={(e) => setForm({ ...form, lastName: e.target.value })}
//             required
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Email Address"
//             type="email"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//             required
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Login Password"
//             type="password"
//             value={form.password}
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//             required
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Mobile Number"
//             value={form.mobile}
//             onChange={(e) => setForm({ ...form, mobile: e.target.value })}
//             required
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Designation"
//             value={form.designation}
//             onChange={(e) => setForm({ ...form, designation: e.target.value })}
//             required
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Department"
//             value={form.department}
//             onChange={(e) => setForm({ ...form, department: e.target.value })}
//             required
//           />

//           <select
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             value={form.role}
//             onChange={(e) => setForm({ ...form, role: e.target.value })}
//           >
//             <option value="Executive">Executive</option>
//             <option value="Manager">Manager</option>
//             <option value="Admin">Admin</option>
//             {/* <option value="Admin">Document Verification</option>
//             <option value="Admin">Intern Part-Time</option>
//             <option value="Admin">Sales Intern</option>
//             <option value="Admin">Admin desk</option> */}
//           </select>

//           <select
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             value={form.status}
//             onChange={(e) => setForm({ ...form, status: e.target.value })}
//           >
//             <option value="Active">Active</option>
//             <option value="Inactive">Inactive</option>
//           </select>

//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none md:col-span-2"
//             placeholder="Joining Date"
//             type="date"
//             value={form.joiningDate}
//             onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
//           />


//           {/* Date of Birth */}
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
//             type="date"
//             value={form.dateOfBirth}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 dateOfBirth: e.target.value,
//               })
//             }
//           />

//           {/* Gender */}
//           <select
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
//             value={form.gender}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 gender: e.target.value,
//               })
//             }
//           >
//             <option value="">Select Gender</option>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//             <option value="Other">Other</option>
//           </select>

//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none md:col-span-2"
//             placeholder="Address"
//             value={form.address}
//             onChange={(e) => setForm({ ...form, address: e.target.value })}
//           />

//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="City"
//             value={form.city}
//             onChange={(e) => setForm({ ...form, city: e.target.value })}
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="State"
//             value={form.state}
//             onChange={(e) => setForm({ ...form, state: e.target.value })}
//           />
//           <input
//             className="rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 outline-none"
//             placeholder="Pincode"
//             value={form.pincode}
//             onChange={(e) => setForm({ ...form, pincode: e.target.value })}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={!isAdmin}
//           className="mt-8 w-full rounded-2xl bg-emerald-600 py-3.5 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.985]"
//         >
//           {isAdmin ? "Add New Employee" : "Admin Access Required"}
//         </button>
//       </form>

//       {/* Password Reset Modal */}
//       {showPasswordModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
//           <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-zinc-900 p-6">
//             <h2 className="mb-5 text-xl font-semibold text-white">
//               Reset Employee Password
//             </h2>

//             <div className="space-y-4">
//               <input
//                 type="password"
//                 placeholder="New Password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full rounded-xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
//               />

//               <input
//                 type="password"
//                 placeholder="Confirm Password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full rounded-xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
//               />
//             </div>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowPasswordModal(false);
//                   setNewPassword("");
//                   setConfirmPassword("");
//                   setSelectedEmployeeId("");
//                 }}
//                 className="rounded-xl border border-slate-600 px-5 py-2 text-slate-300 hover:bg-slate-800"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleResetPassword}
//                 disabled={changingPassword}
//                 className="rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
//               >
//                 {changingPassword ? "Updating..." : "Update Password"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






'use client';

import React, { useEffect, useState } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  UserCog,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  KeyRound,
  User,
} from "lucide-react";

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  designation: string;
  department: string;
  status: string;
  joiningDate: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface EmployeeListProps {
  searchTerm?: string;
}

export default function EmployeeList({ searchTerm = "" }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
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

  async function fetchEmployees() {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        const role = data.user?.role?.toString().toLowerCase();
        setIsAdmin(role === "admin");
      } catch (error) {
        console.error(error);
      }
    }
    loadUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) {
      alert("Only admins can add employees.");
      return;
    }

    if (!form.password.trim()) {
      alert("Please enter a password for the employee login.");
      return;
    }

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
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
      fetchEmployees();
    } else {
      const data = await res.json();
      alert(data.message || "Unable to create employee");
    }
  }

  async function handleDelete(employeeId: string) {
    if (!isAdmin) {
      alert("Only admins can delete employees.");
      return;
    }
    if (!confirm("Delete this employee?")) return;

    const res = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
    if (res.ok) fetchEmployees();
    else {
      const data = await res.json();
      alert(data.message || "Unable to delete employee");
    }
  }

  async function handleResetPassword() {
    if (newPassword.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch(`/api/employees/${selectedEmployeeId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Password updated successfully.");
      setShowPasswordModal(false);
      setSelectedEmployeeId("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      alert("Unable to update password.");
    } finally {
      setChangingPassword(false);
    }
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      `${emp.firstName} ${emp.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fullName =
    [form.firstName, form.lastName].filter(Boolean).join(" ") || "New Employee";

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-800 bg-zinc-900/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 p-4 xl:grid-cols-[1.15fr_0.85fr] sm:p-6">
      {/* ===================== LEFT: Team Roster ===================== */}
      <div className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-6 shadow-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Team Roster</h2>
            <p className="text-sm text-slate-400">
              {filteredEmployees.length} member
              {filteredEmployees.length !== 1 ? "s" : ""}
              {searchTerm ? " matching your search" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <UserCog className="h-4 w-4" />
            {isAdmin ? "Admin Access" : "View Only"}
          </div>
        </div>

        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.employeeId}
              className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-zinc-950 p-4 transition-all hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                {employee.firstName?.charAt(0).toUpperCase()}
                {employee.lastName?.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${employee.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                      }`}
                  >
                    {employee.status}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                  <a
                    href={`mailto:${employee.email}`}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{employee.email}</span>
                  </a>
                  {employee.mobile && (
                    <a
                      href={`tel:${employee.mobile}`}
                      className="flex items-center gap-1.5 hover:text-white"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {employee.mobile}
                    </a>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-violet-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {employee.designation}
                  </span>
                  <span>•</span>
                  <span>{employee.department}</span>
                  {employee.joiningDate && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Joined{" "}
                        {new Date(employee.joiningDate).toLocaleDateString(
                          "en-IN",
                          { month: "short", year: "numeric" }
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setSelectedEmployeeId(employee.employeeId);
                      setShowPasswordModal(true);
                    }}
                    className="rounded-xl p-2.5 text-cyan-400 transition hover:bg-cyan-500/10"
                    title="Reset Password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.employeeId)}
                    className="rounded-xl p-2.5 text-red-400 transition hover:bg-red-500/10"
                    title="Delete Employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">
              <User className="mx-auto mb-3 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">
                {searchTerm
                  ? "No matching employees found."
                  : "No employees yet. Add your first team member →"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===================== RIGHT: Add Employee Form ===================== */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-zinc-900/70 p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-2">
            <Plus className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Add New Employee</h2>
            <p className="text-xs text-slate-400">Preview updates live below</p>
          </div>
        </div>

        {/* FORM FIELDS */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              First Name *
            </label>
            <input
              className="input"
              placeholder="e.g. Rahul"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Last Name *
            </label>
            <input
              className="input"
              placeholder="e.g. Sharma"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Email *
            </label>
            <input
              className="input"
              placeholder="employee@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Login Password *
            </label>
            <input
              className="input"
              placeholder="Min 6 characters"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Mobile *
            </label>
            <input
              className="input"
              placeholder="9876543210"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              required
            />
          </div>

          {/* Designation */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Designation *
            </label>
            <input
              className="input"
              placeholder="e.g. Software Developer"
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Department *
            </label>
            <input
              className="input"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="Executive">Executive</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Joining Date */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Joining Date
            </label>
            <input
              className="input"
              type="date"
              value={form.joiningDate}
              onChange={(e) =>
                setForm({ ...form, joiningDate: e.target.value })
              }
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">
              Date of Birth
            </label>
            <input
              className="input"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Gender</label>
            <select
              className="input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-slate-400">
              Address
            </label>
            <input
              className="input"
              placeholder="House no, street, landmark..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* City / State / Pincode */}
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">City</label>
            <input
              className="input"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">State</label>
            <input
              className="input"
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-slate-400">
              Pincode
            </label>
            <input
              className="input"
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isAdmin}
          className="mt-6 w-full rounded-2xl bg-emerald-600 py-3.5 font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAdmin ? "Add New Employee" : "Admin Access Required"}
        </button>
      </form>

      {/* ===================== Password Reset Modal ===================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/15 p-2.5">
                <KeyRound className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Reset Password
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-slate-400">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setSelectedEmployeeId("");
                }}
                className="rounded-xl border border-slate-600 px-5 py-2.5 text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleResetPassword}
                disabled={changingPassword}
                className="rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared styles */}
      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(51 65 85);
          background: rgb(9 9 11);
          padding: 0.7rem 1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .input:focus {
          border-color: rgb(16 185 129);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
        }

        .input::placeholder {
          color: rgb(100 116 139);
        }
      `}</style>
    </div>
  );
}