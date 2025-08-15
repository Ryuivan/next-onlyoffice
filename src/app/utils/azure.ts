/**
 * utils/azure.ts
 *
 * Utility untuk menginisialisasi koneksi ke Azure Blob Storage
 * dan menyediakan helper function untuk mendapatkan container client.
 */

import { BlobServiceClient } from '@azure/storage-blob'

// Ambil connection string dari environment variable
// Pastikan AZURE_STORAGE_CONNECTION_STRING sudah didefinisikan di .env
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!

// Validasi jika connection string tidak ditemukan
if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined in environment")
}

/**
 * Instance utama untuk berinteraksi dengan Azure Blob Storage.
 * Dibuat menggunakan connection string agar mudah digunakan di seluruh aplikasi.
 */
export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)

/**
 * Helper function untuk mendapatkan container client.
 * 
 * @param containerName - Nama container di Azure Blob Storage.
 * @returns ContainerClient yang dapat digunakan untuk upload, download, dan operasi blob lainnya.
 *
 * Contoh penggunaan:
 * ```ts
 * const containerClient = getContainerClient('documents')
 * const blobClient = containerClient.getBlockBlobClient('myfile.docx')
 * ```
 */
export function getContainerClient(containerName: string) {
  return blobServiceClient.getContainerClient(containerName)
}
