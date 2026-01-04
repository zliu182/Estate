// export - Can be referenced by external code

export type Staff = {
  branchno: string;
  staffno: string;
  fname: string;
  lname: string;
  position: string;
  sex: string;
  dob: string;
  salary: number;
  telephone: string;
  mobile: string;
  email: string;
};

export type Branch = {
  branchno: string;
  street: string;
  city: string;
  postcode: string;
};

export type Client = {
  clientno: string;
  fname: string;
  lname: string;
  telno: string;
  street: string;
  city: string;
  email: string;
  preftype: string;
  maxrent: number;
};

export type Lease = {
  leaseno: number;
  clientno: string;
  propertyno: string;
  leaseamount: number;
  lease_start: string;
  lease_end: string;
};

export type PrivateOwner = {
  ownerno: string;
  fname: string;
  lname: string;
  address: string;
  telno: string;
  email: string;
};

export type PropertyForRent = {
  propertyno: string;
  street: string;
  city: string;
  postcode: string;
  type: string;
  rooms: number;
  rent: number;
  ownerno: string;
  staffno: string;
  branchno: string;
};

export type Registration = {
  id: string;
  clientno: string;
  branchno: string;
  staffno: string;
  dateregister: string;
};

export type Viewing = {
  id: string;
  clientno: string;
  propertyno: string;
  viewdate: string;
  comments: string | null;
};
