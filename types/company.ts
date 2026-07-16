export interface Company {
  companyId: string;
  companyName: string;
  companyType: string;

  contactPerson: string;
  designation: string;

  mobile: string;
  alternateMobile?: string;

  email: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  gstNumber?: string;
  panNumber?: string;
  website?: string;

  assignedEmployeeId?: string;

  status: "Active" | "Inactive";

  notes?: string;

  tiedUpDate: string;

  createdAt: string;
  updatedAt: string;
}