import { getContainer } from "../../cosmosDB";
import { Client } from "../../types";

export const getClients = async (): Promise<Client[]> => {
  const query = `SELECT c.clientno, 
    c.fname || ' ' || c.lname AS clientName, 
    c.telno, 
    c.street, 
    c.city, 
    c.email, 
    c.preftype, 
    c.maxrent 
    FROM c`;

  const container = await getContainer("client");
  const queryResponse = await container.items.query<Client>(query).fetchAll();

  return queryResponse.resources;
};
