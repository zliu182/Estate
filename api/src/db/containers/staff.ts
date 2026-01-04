import { getContainer } from "../../cosmosDB";
import { formatDob } from "../../helper";
import { Staff } from "../../types";

// Async function - get a list of staffs
export const getStaffs = async (): Promise<Staff[]> => {
  const query = `SELECT 
    c.staffno, 
    c.fname || ' ' || c.lname AS fullname, 
    c.position, 
    c.sex, 
    c.dob,
    c.salary,
    c.telephone,
    c.mobile,
    c.email
    FROM c`; // access staff container

  const container = await getContainer("staff"); // get container name
  const queryResponse = await container.items.query<Staff>(query).fetchAll();

  return queryResponse.resources.map((s) => {
    return {
      ...s,
      dob: formatDob(s.dob),
    };
  });
};
