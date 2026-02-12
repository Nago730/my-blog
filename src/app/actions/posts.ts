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
  const publicId = formData.get("publicId") as string;

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
      // 이미지 정보를 하나로 그룹화
      image: {
        url: image,           // Cloudinary secure_url
        publicId: publicId,   // 삭제/수정 시 필요한 ID
        alt: title,           // SEO 및 접근성을 위해 제목을 기본 alt로 활용
      },
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
      const data = docSnap.data();
      // 새 구조 (data.image.publicId) 또는 구버전 필드 (data.publicId) 확인
      const publicId = data?.image?.publicId || data?.publicId;

      if (publicId) {
        // publicId가 있으면 직접 사용
        const { deleteImageById } = await import("@/lib/cloudinary");
        await deleteImageById(publicId);
      } else {
        // 둘 다 없으면 URL 추출 시도 (구버전 호환용)
        const imageUrl = data?.image?.url || data?.image;
        if (imageUrl && typeof imageUrl === "string") {
          const { deleteImage } = await import("@/lib/cloudinary");
          await deleteImage(imageUrl);
        }
      }
      await docRef.delete();
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("글 삭제 중 오류가 발생했습니다.");
  }

  revalidatePath("/articles");
}
