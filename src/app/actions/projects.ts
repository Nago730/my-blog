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
  const featured = formData.get("featured") === "on";

  // 다중 이미지 처리
  const imageUrls = formData.getAll("images[]") as string[];
  const publicIds = formData.getAll("publicIds[]") as string[];

  const images = imageUrls.map((url, index) => ({
    url,
    publicId: publicIds[index] || "",
    alt: title,
  }));

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
      // 다중 이미지 배열 저장
      images,
      // 구버전 호환성을 위해 첫 번째 이미지를 image 필드에도 저장
      image: images.length > 0 ? images[0] : null,
      featured,
      isDeleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding project: ", error);
    throw new Error("프로젝트 저장 중 오류가 발생했습니다.");
  }

  revalidatePath("/projects");
  redirect("/projects");
}

export async function deleteProject(id: string) {
  await checkAdminAuth();

  try {
    const docRef = adminDb.collection("projects").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Soft Delete: 문서를 삭제하는 대신 상태만 변경
      await docRef.update({
        isDeleted: true,
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("프로젝트 삭제 중 오류가 발생했습니다.");
  }

  revalidatePath("/projects");
}
