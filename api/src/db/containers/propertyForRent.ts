import { getContainer } from "../../cosmosDB";
import { PropertyForRent } from "../../types";

export const getPropertiesRent = async (): Promise<PropertyForRent[]> => {
  const query = `SELECT c.propertyno, 
    c.street, 
    c.city, 
    c.postcode, 
    c.type, 
    c.rooms, 
    c.rent, 
    c.ownerno, 
    c.staffno, 
    c.branchno 
    FROM c`;

  const container = await getContainer("propertyForRent");
  const queryResponse = await container.items
    .query<PropertyForRent>(query)
    .fetchAll();

  return queryResponse.resources;
};
