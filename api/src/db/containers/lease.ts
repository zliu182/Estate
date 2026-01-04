import { getContainer } from "../../cosmosDB";
import { formatDob } from "../../helper";
import { Lease } from "../../types";

export const getLeases = async (): Promise<Lease[]> => {
  const query = `SELECT c.leaseno, 
        c.clientno, 
        c.propertyno, 
        c.leaseamount, 
        'From: '|| c.lease_start || ', To: ' || c.lease_end AS leasePeriod 
        FROM c`;

  const container = await getContainer("lease");
  const queryResponse = await container.items.query<Lease>(query).fetchAll();

  return queryResponse.resources.map((l) => {
    return {
      ...l,
      lease_start: formatDob(l.lease_start),
      lease_end: formatDob(l.lease_end),
    };
  });
};
