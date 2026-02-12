"use server";

import { v2 as cloudinary } from "cloudinary";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;

  if (!token) {
    throw new Error("인증되지 않은 사용자입니다.");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken.email !== ADMIN_EMAIL) {
      throw new Error("권한이 없습니다.");
    }
    return decodedToken;
  } catch (error) {
    console.error("Auth Verification Error:", error);
    throw new Error("관리자 권한 확인에 실패했습니다.");
  }
}

export async function getCloudinarySignature(presetName?: string) {
  await checkAdminAuth();

  const timestamp = Math.round(new Date().getTime() / 1000);
  const uploadPreset = (presetName || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  if (!apiSecret) {
    throw new Error("Cloudinary API Secret이 설정되지 않았습니다.");
  }

  const paramsToSign: any = {
    source: "uw",
    timestamp: timestamp,
  };

  if (uploadPreset) {
    paramsToSign.upload_preset = uploadPreset;
  }

  // Cloudinary SDK를 사용하여 서명 생성
  // 이 함수는 내부적으로 키를 정렬하고 시크릿을 붙여 SHA1 해시를 만듭니다.
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret
  );

  console.log("Generating signature for:", paramsToSign);
  console.log("Generated signature:", signature);

  return {
    signature,
    timestamp,
    uploadPreset,
    apiKey,
    cloudName,
  };
}
