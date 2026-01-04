import { getContainer } from "../../cosmosDB";
import { PrivateOwner } from "../../types";

export const getPrivateOwners = async (): Promise<PrivateOwner[]> => {
  const query = `SELECT c.ownerno, 
    c.fname || ' ' || c.lname AS ownerName, 
    c.address, 
    c.telno, 
    c.email 
    FROM c`;

  const container = await getContainer("privateOwner");
  const queryResponse = await container.items
    .query<PrivateOwner>(query)
    .fetchAll();

  return queryResponse.resources;
};
