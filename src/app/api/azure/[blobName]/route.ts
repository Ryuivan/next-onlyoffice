import { NextResponse, type NextRequest } from "next/server";

import { getContainerClient } from "@/app/utils/azure";
import { OnlyOfficeCallbackType } from "./types";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ blobName: string }> }
) => {
  const { blobName } = await params;
  const decodedBlobName = decodeURIComponent(blobName);

  try {
    const blobClient =
      getContainerClient("documents").getBlobClient(decodedBlobName);

    if (!(await blobClient.exists())) throw new Error("File not found");

    const properties = await blobClient.getProperties();

    return NextResponse.json(properties);
  } catch (error) {
    console.log("GET", error, "error");

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
};

/**
 * Download remote file & return as Buffer.
 */
const createBuffer = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Failed to download file: ${res.statusText}`);

  return Buffer.from(await res.arrayBuffer());
};

/**
 * Upload buffer to blob with standard headers.
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

    if ((status === 2 || status === 6) && url) {
      const buffer = await createBuffer(url);

      await uploadBlob(decodedBlobName, buffer);

      console.log("POST", `File uploaded as ${decodedBlobName}`, "info");

      return NextResponse.json({
        message: `Uploaded as ${decodedBlobName}`,
        error: 0,
      });
    }

    return NextResponse.json({ error: 0 });
  } catch (error) {
    console.log("POST", error, "error");

    return NextResponse.json(
      { message: `${error}`, error: 1 },
      { status: 500 }
    );
  }
};
