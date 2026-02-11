"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
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
    await addDoc(collection(db, "posts"), {
      title,
      description,
      category,
      readTime,
      content,
      image,
      date: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("글 저장 중 오류가 발생했습니다.");
  }

  revalidatePath("/articles");
  redirect("/articles");
}
