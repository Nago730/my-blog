"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
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

  // Split tags by comma and trim whitespace
  const tags = tagsStr ? tagsStr.split(",").map(tag => tag.trim()).filter(tag => tag !== "") : [];

  try {
    await addDoc(collection(db, "projects"), {
      title,
      description,
      detailContent,
      tags,
      link,
      github,
      image,
      featured,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding project: ", error);
    throw new Error("프로젝트 저장 중 오류가 발생했습니다.");
  }

  revalidatePath("/projects");
  redirect("/projects");
}
