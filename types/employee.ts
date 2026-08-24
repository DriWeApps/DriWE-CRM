export interface Employee {
  employeeId: string;

  firstName: string;
  lastName: string;

  email: string;
  mobile: string;

  designation: string;
  department: string;

  role: string;
  status: string;

  portal?: "crm" | "construction" | "both";

  joiningDate: string;
  dateOfBirth?: string;
  gender?: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  pageAccess: string[];

  createdAt: string;
  updatedAt: string;
}