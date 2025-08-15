import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined in environment");
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

export function getContainerClient(containerName: string) {
  return blobServiceClient.getContainerClient(containerName);
}