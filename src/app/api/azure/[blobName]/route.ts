import { NextResponse, type NextRequest } from "next/server";
import { getContainerClient } from "@/app/utils/azure";
import { OnlyOfficeCallbackType } from "./types";

/**
 * GET /api/azure/[blobName]
 *
 * Mengambil properti metadata file tertentu dari Azure Blob Storage.
 * Digunakan saat ingin mengetahui detail file (misal: ukuran, tipe MIME, dll.)
 */
export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ blobName: string }> }
) => {
  const { blobName } = await params;
  const decodedBlobName = decodeURIComponent(blobName);

  try {
    const blobClient =
      getContainerClient("documents").getBlobClient(decodedBlobName);

    // Pastikan file ada
    if (!(await blobClient.exists())) throw new Error("File not found");

    // Ambil properti file (size, type, metadata, dll.)
    const properties = await blobClient.getProperties();

    return NextResponse.json(properties);
  } catch (error) {
    console.log("GET", error, "error");
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
};

/**
 * Helper: Download remote file dan mengubahnya menjadi Buffer.
 * Digunakan untuk mengambil file dari OnlyOffice callback `url`.
 */
const createBuffer = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download file: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
};

/**
 * Helper: Upload buffer ke Azure Blob Storage.
 * Menggunakan MIME type `application/octet-stream` dan `no-cache`.
 */
const uploadBlob = async (blobName: string, buffer: Buffer) => {
  const blobClient =
    getContainerClient("documents").getBlockBlobClient(blobName);

  await blobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: "application/octet-stream",
      blobCacheControl: "no-cache",
    },
  });
};

/**
 * POST /api/azure/[blobName]
 *
 * Endpoint callback untuk OnlyOffice.
 *
 * - OnlyOffice memanggil endpoint ini ketika dokumen disimpan.
 * - Jika status adalah `2` (dokumen di-save) atau `6` (force save)
 *   dan ada `url` file, maka file akan diunduh lalu diunggah ke Azure.
 */
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ blobName: string }> }
) => {
  try {
    const body = (await req.json()) as OnlyOfficeCallbackType;
    console.log("OnlyOffice Callback", body, "warn");

    const { blobName } = await params;
    const decodedBlobName = decodeURIComponent(blobName);

    const { status, url } = body;

    // Status 2 & 6 = dokumen berhasil disimpan di OnlyOffice
    if ((status === 2 || status === 6) && url) {
      const buffer = await createBuffer(url);
      await uploadBlob(decodedBlobName, buffer);

      console.log("POST", `File uploaded as ${decodedBlobName}`, "info");

      return NextResponse.json({
        message: `Uploaded as ${decodedBlobName}`,
        error: 0,
      });
    }

    // Jika bukan status penyimpanan, kembalikan sukses tanpa upload
    return NextResponse.json({ error: 0 });
  } catch (error) {
    console.log("POST", error, "error");

    return NextResponse.json(
      { message: `${error}`, error: 1 },
      { status: 500 }
    );
  }
};
