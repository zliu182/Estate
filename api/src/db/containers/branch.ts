import { getContainer } from "../../cosmosDB";
import { Branch } from "../../types";

export const getBranches = async (): Promise<Branch[]> => {
  const query = `SELECT c.branchno, c.street, c.city, c.postcode FROM c`;

  const container = await getContainer("branch");
  const queryResponse = await container.items.query<Branch>(query).fetchAll();

  return queryResponse.resources;
};
