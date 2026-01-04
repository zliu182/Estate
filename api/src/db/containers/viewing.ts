import { getContainer } from "../../cosmosDB";
import { formatDob } from "../../helper";
import { Viewing } from "../../types";

export const getViewingRecords = async (): Promise<Viewing[]> => {
  const query = `SELECT c.id, c.clientno, c.propertyno, c.viewdate, c.comments FROM c`;

  const container = await getContainer("viewing");
  const queryResponse = await container.items.query<Viewing>(query).fetchAll();

  return queryResponse.resources.map((v) => {
    return {
      ...v,
      viewdate: formatDob(v.viewdate),
    };
  });
};
