import { Container, CosmosClient, CosmosClientOptions } from "@azure/cosmos";
import { getEnvVariableOrThrow } from "../system/index.js"; // Compile Typescript to Javascript

const containerMap: Map<String, Container> = new Map()

// TO-DO - Use AAD token later
const opts: CosmosClientOptions = {
  endpoint: "https://estate-db.documents.azure.com:443/",
  connectionString: getEnvVariableOrThrow('CONNECTION_STRING')
};

const client = new CosmosClient(opts)
const cosmosDBName = 'estate-db'

// Only 1 database
export const getContainer = async (container: string): Promise<Container> => {
    let containerClient = containerMap.get(container)
    if (containerClient) {
        return containerClient;
    } else {
        containerClient = client.database(cosmosDBName).container(container);
        containerMap.set(container, containerClient);
        return containerClient;
    }
}