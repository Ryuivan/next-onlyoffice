import { NextResponse } from "next/server";

import type { BlobItem } from "@azure/storage-blob";
import { getContainerClient } from "@/app/utils/azure";


export const GET = async (): Promise<NextResponse<BlobItem[] | { error: string }>> => {
  try {
    const containerClient = getContainerClient('documents');
    const versionPattern = /_v\d+(\.[^.]+)$/;

    const blobs: BlobItem[] = [];

    for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
      if (!versionPattern.test(blob.name)) {
        blobs.push(blob);
      }
    }

    return NextResponse.json(blobs);
  } catch (error) {
    console.log('getDocuments', error, 'error');

    return NextResponse.json({ error: 'Failed to list files.' }, { status: 500 });
  }
};