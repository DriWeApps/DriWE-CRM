export interface Employee {
  employeeId: string;

  firstName: string;
  lastName: string;

  email: string;
  mobile: string;

  designation: string;
  department: string;

  role: "Admin" | "Manager" | "Executive";

  status: "Active" | "Inactive";

  joiningDate: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  createdAt: string;
  updatedAt: string;
}