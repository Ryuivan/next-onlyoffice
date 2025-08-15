import { NextResponse } from "next/server";
import type { BlobItem } from "@azure/storage-blob";
import { getContainerClient } from "@/app/utils/azure";

/**
 * API endpoint (GET /api/azure)
 *
 * Tujuan:
 * - Mengambil daftar semua blob (file) dari container "documents"
 * - Mengecualikan file yang merupakan versi historis (yang punya suffix `_v<number>.<ext>`)
 *
 * Contoh:
 * - "proposal.docx" akan dimasukkan
 * - "proposal_v2.docx" akan dilewatkan
 */
export const GET = async (): Promise<
  NextResponse<BlobItem[] | { error: string }>
> => {
  try {
    // Koneksi ke Azure Blob Storage, container "documents"
    const containerClient = getContainerClient("documents");

    // Pola regex untuk mendeteksi file versi (_v1, _v2, dst)
    const versionPattern = /_v\d+(\.[^.]+)$/;

    const blobs: BlobItem[] = [];

    // Iterasi semua blob di container
    for await (const blob of containerClient.listBlobsFlat({
      includeMetadata: true,
    })) {
      // Hanya ambil file utama (bukan versi historis)
      if (!versionPattern.test(blob.name)) {
        blobs.push(blob);
      }
    }

    // Kembalikan daftar blob dalam bentuk JSON
    return NextResponse.json(blobs);
  } catch (error) {
    console.log("getDocuments", error, "error");
    return NextResponse.json(
      { error: "Failed to list files." },
      { status: 500 }
    );
  }
};
