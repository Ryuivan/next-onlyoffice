// app/api/oo-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

const ALLOW = /^https:\/\/[a-z0-9-]+\.blob\.core\.windows\.net\/.+/i;

export async function GET(req: NextRequest) {
  return relay(req, "GET");
}
export async function HEAD(req: NextRequest) {
  return relay(req, "HEAD");
}

async function relay(req: NextRequest, method: "GET" | "HEAD") {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new NextResponse("Missing u", { status: 400 });

  // base64url decode
  const target = Buffer.from(
    u.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
  if (!ALLOW.test(target))
    return new NextResponse("Forbidden", { status: 403 });

  // forward essential headers (Range, validators)
  const fwd: Record<string, string> = {};
  for (const h of ["range", "if-none-match", "if-modified-since"]) {
    const v = req.headers.get(h);
    if (v) fwd[h] = v;
  }

  const resp = await fetch(target, {
    method,
    headers: fwd,
    redirect: "manual",
    cache: "no-store"
  });

  // pass back the headers DS cares about
  const hdr = new Headers();
  for (const h of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
    "cache-control",
    "content-md5",
    "content-disposition"
  ]) {
    const v = resp.headers.get(h);
    if (v) hdr.set(h, v);
  }
  hdr.set("Cache-Control", "private, max-age=0");

  return new NextResponse(method === "HEAD" ? null : resp.body, {
    status: resp.status,
    headers: hdr
  });
}
