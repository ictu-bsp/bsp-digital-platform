import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const scoutName = String(formData.get("scoutName") || "scout").replace(/[^a-zA-Z0-9._-]+/g, "-");
  const requirementName = String(formData.get("requirementName") || "requirement").replace(/[^a-zA-Z0-9._-]+/g, "-");
  const rankName = String(formData.get("rankName") || "rank").replace(/[^a-zA-Z0-9._-]+/g, "-");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = path.extname(file.name) || ".bin";
  const safeName = `${scoutName}-${rankName}-${requirementName}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "advancement");

  await mkdir(uploadDir, { recursive: true });
  const destination = path.join(uploadDir, safeName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, bytes);

  return NextResponse.json({
    url: `/uploads/advancement/${safeName}`,
    fileName: safeName,
  });
}
