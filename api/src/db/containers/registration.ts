import { getContainer } from "../../cosmosDB";
import { formatDob } from "../../helper";
import { Registration } from "../../types";

export const getRegistrationRecords = async (): Promise<Registration[]> => {
  const query = `SELECT c.id, c.clientno, c.branchno, c.staffno, c.dateregister FROM c`;

  const container = await getContainer("registration");
  const queryResponse = await container.items
    .query<Registration>(query)
    .fetchAll();

  return queryResponse.resources.map((r) => {
    return {
      ...r,
      dateregister: formatDob(r.dateregister),
    };
  });
};
