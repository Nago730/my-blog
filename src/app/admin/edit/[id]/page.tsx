import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import EditPostForm from "@/components/EditPostForm";

async function getPost(id: string) {
  try {
    const docSnap = await adminDb.collection("posts").doc(id).get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.isDeleted === true) return null;

      // Firestore Timestamp 객체 등을 제외하고 클라이언트 컴포넌트가 필요한 데이터만 추출하여 전달 (Plain Object로 변환)
      return {
        id: docSnap.id,
        title: data?.title || "",
        slug: data?.slug || "",
        ogImage: data?.ogImage || "",
        content: data?.content || "",
        description: data?.description || "",
        category: data?.category || "개발",
        readTime: data?.readTime || "",
        images: data?.images || [],
        tags: data?.tags || [],
      };
    }
    return null;
  } catch (error) {
    console.error("Firebase admin fetch error:", error);
    return null;
  }
}

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <EditPostForm post={post} />;
}
