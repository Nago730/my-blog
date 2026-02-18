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

  // 다중 이미지 처리
  const imageUrls = formData.getAll("images[]") as string[];
  const publicIds = formData.getAll("publicIds[]") as string[];

  const images = imageUrls.map((url, index) => ({
    url,
    publicId: publicIds[index] || "",
    alt: title,
  }));

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
      // 다중 이미지 배열 저장
      images,
      // 구버전 호환성을 위해 첫 번째 이미지를 image 필드에도 저장 (선택 사항이나 권장)
      image: images.length > 0 ? images[0] : null,
      // 정렬용 날짜 (문자열)
      date: new Date().toISOString().split("T")[0],
      // 정확한 생성 시점 (Firebase 서버 시간)
      createdAt: FieldValue.serverTimestamp(),
      // 업데이트 시점
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("글 저장 중 오류가 발생했습니다.");
  }

  revalidatePath("/articles");
  redirect("/articles");
}

export async function deletePost(id: string) {
  await checkAdminAuth();

  try {
    const docRef = adminDb.collection("posts").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Soft Delete: 문서를 삭제하는 대신 상태만 변경
      await docRef.update({
        isDeleted: true,
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 이미지는 삭제하지 않고 유지합니다 (Soft Delete의 목적)
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("글 삭제 중 오류가 발생했습니다.");
  }

  revalidatePath("/articles");
  redirect("/articles");
}
