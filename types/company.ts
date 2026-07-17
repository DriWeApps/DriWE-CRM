export interface Company {
  id?: string;
  companyId?: string;
  companyName: string;
  companyType?: string;
  contactPerson?: string;
  designation?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  assignedEmployeeId?: string;
  status: "Active" | "Inactive";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}