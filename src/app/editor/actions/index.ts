"use server";

import jwt from "jsonwebtoken";

import crypto from "crypto";

import {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  type BlobGetPropertiesResponse,
} from "@azure/storage-blob";
import { getContainerClient } from "@/app/utils/azure";

export const getBlobPropertiesByName = async (
  blobName: string
): Promise<BlobGetPropertiesResponse> => {
  try {
    const res = await fetch(
      `${process.env.BASE_URL!}/api/azure/${encodeURIComponent(blobName)}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) throw new Error("Failed to get blob");

    const data = await res.json();

    return data;
  } catch (error) {
    console.log("getFileMetadata", error, "error");
    throw error;
  }
};

export const getBlobDownloadUrl = async (
  blobName: string,
  containerName: string = "documents",
  accountName: string = "camundapoc"
): Promise<string> => {
  try {
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
    const credential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        protocol: SASProtocol.Https,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000),
      },
      credential
    ).toString();

    const downloadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}&ts=${Date.now()}`;

    return downloadUrl;
  } catch (error) {
    console.log(
      "getFileDownloadUrl",
      "Failed to generate download URL: " + error,
      "error"
    );
    throw error;
  }
};

const getSafeTitle = (blobName: string): string => {
  const dotIndex = blobName.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? blobName.substring(0, dotIndex) : blobName;
  const ext = dotIndex !== -1 ? blobName.substring(dotIndex) : "";

  const safeBaseName = baseName.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");

  const safeTitle = `${safeBaseName}${ext}`;

  return safeTitle;
};

const streamToBuffer = async (
  readableStream: NodeJS.ReadableStream
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    readableStream.on("data", (data) =>
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    );
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
};

const getOnlyOfficeKey = async (blobName: string): Promise<string> => {
  const containerClient = getContainerClient("documents");
  const blobClient = containerClient.getBlobClient(blobName);

  const download = await blobClient.download();
  const buffer = await streamToBuffer(download.readableStreamBody!);

  return crypto.createHash("sha256").update(buffer).digest("hex");
};

export const getOnlyOfficeConfig = async (blobName: string) => {
  try {
    const properties = await getBlobPropertiesByName(blobName);

    if (!properties) {
      throw new Error("File properties not found");
    }

    const url = await getBlobDownloadUrl(blobName);

    if (!url) {
      throw new Error("File download URL not found");
    }

    const key = await getOnlyOfficeKey(blobName);
    const safeTitle = getSafeTitle(blobName);

    console.log("getOnlyOfficeConfig", `safeTitle: ${safeTitle}`, "info");

    const fileType = blobName.split(".").pop()?.toLowerCase() || "";
    const documentType =
      fileType === "docx" || fileType === "doc"
        ? "word"
        : fileType === "xlsx" || fileType === "xls"
        ? "cell"
        : fileType === "pptx" || fileType === "ppt"
        ? "slide"
        : "pdf";
    const mode = fileType === "pdf" ? "view" : "edit";

    const config = {
      document: {
        title: blobName,
        url,
        fileType,
        key,
      },
      documentType,
      editorConfig: {
        mode,
        callbackUrl: `${
          process.env.BASE_URL
        }/api/azure/${encodeURIComponent(blobName)}`,
        customization: {
          autosave: true,
          chat: true,
          feedback: true,
          comments: true,
        },
      },
    };

    console.log(
      "getOnlyOfficeConfig",
      `OnlyOffice configuration retrieved: ${JSON.stringify(config, null, 2)}`,
      "info"
    );

    const token = jwt.sign(config, process.env.ONLYOFFICE_JWT_SECRET!, {
      algorithm: "HS256",
    });

    return {
      ...config,
      token,
    };
  } catch (error) {
    console.log(
      "getOnlyOfficeConfig",
      `Error retrieving OnlyOffice configuration: ${error}`,
      "error"
    );
    throw error;
  }
};
