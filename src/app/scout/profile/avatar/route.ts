// src/app/scout/profile/avatar/route.ts

import { NextRequest, NextResponse } from "next/server";

import {
  writeFile,
  mkdir,
  unlink,
} from "fs/promises";

import path from "path";
import crypto from "crypto";

import { getCurrentUser } from "@/lib/auth/current-user";

import {
  updateAvatar,
  getAvatar,
} from "@/services/profile.service";

export async function POST(
  request: NextRequest
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image uploads are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    const previousAvatar = await getAvatar(user.id);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension =
      path.extname(file.name) || ".png";

    const filename =
      `${crypto.randomUUID()}${extension}`;

    const uploadFolder = path.join(
      process.cwd(),
      "public",
      "uploads",
      "avatars"
    );

    await mkdir(uploadFolder, {
      recursive: true,
    });

    const filePath = path.join(
      uploadFolder,
      filename
    );

    await writeFile(filePath, buffer);

    const avatarUrl =
      `/uploads/avatars/${filename}`;

    await updateAvatar(
      user.id,
      avatarUrl
    );

    if (previousAvatar) {
      try {
        const oldAvatar = path.join(
          process.cwd(),
          "public",
          previousAvatar.replace(/^\/+/, "")
        );

        await unlink(oldAvatar);
      } catch {
        // Ignore if the old file doesn't exist.
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload avatar.",
      },
      {
        status: 500,
      }
    );
  }
}