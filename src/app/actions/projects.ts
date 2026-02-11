"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;

  if (!token) throw new Error("인증되지 않은 사용자입니다.");

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken.email !== ADMIN_EMAIL) throw new Error("권한이 없습니다.");
    return decodedToken;
  } catch (error) {
    console.error("Auth Verification Error:", error);
    throw new Error("관리자 권한 확인에 실패했습니다.");
  }
}

export async function createProject(formData: FormData) {
  await checkAdminAuth();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const detailContent = formData.get("content") as string;
  const tagsStr = formData.get("tags") as string;
  const link = formData.get("link") as string;
  const github = formData.get("github") as string;
  const image = formData.get("image") as string;
  const featured = formData.get("featured") === "on";

  if (!title || !detailContent) {
    throw new Error("제목과 상세 내용은 필수입니다.");
  }

  const tags = tagsStr ? tagsStr.split(",").map(tag => tag.trim()).filter(tag => tag !== "") : [];

  try {
    await adminDb.collection("projects").add({
      title,
      description,
      detailContent,
      tags,
      link,
      github,
      image,
      featured,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding project: ", error);
    throw new Error("프로젝트 저장 중 오류가 발생했습니다.");
  }

  revalidatePath("/projects");
  redirect("/projects");
}
