"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// 서버 전용 환경변수 (보안을 위해 NEXT_PUBLIC 제거 버전 사용)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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

export async function createPost(formData: FormData) {
  // 서버 측에서 완벽한 권한 확인
  await checkAdminAuth();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const readTime = formData.get("readTime") as string;
  const content = formData.get("content") as string;
  const image = formData.get("image") as string;

  if (!title || !content) {
    throw new Error("제목과 내용은 필수입니다.");
  }

  try {
    await adminDb.collection("posts").add({
      title,
      description,
      category,
      readTime,
      content,
      image,
      date: new Date().toISOString().split("T")[0],
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("글 저장 중 오류가 발생했습니다.");
  }

  revalidatePath("/articles");
  redirect("/articles");
}
