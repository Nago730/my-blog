"use server";

import { adminDb } from "@/lib/firebase-admin";
import { ScheduleItem } from "@/types/schedule";

export async function getScheduleItems(userId?: string): Promise<ScheduleItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return [];
    }

    let query: any = adminDb.collection("schedules");
    if (userId) {
      query = query.where("userId", "==", userId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as ScheduleItem[];
  } catch (error) {
    console.error("Failed to fetch schedule items from Firestore:", error);
    return [];
  }
}

export async function saveScheduleItem(item: Omit<ScheduleItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  try {
    const now = new Date().toISOString();
    
    if (item.id) {
      const { id, ...data } = item;
      await adminDb.collection("schedules").doc(id).set(
        {
          ...data,
          updatedAt: now,
        },
        { merge: true }
      );
      return { success: true, id };
    } else {
      const docRef = adminDb.collection("schedules").doc();
      await docRef.set({
        ...item,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, id: docRef.id };
    }
  } catch (error) {
    console.error("Failed to save schedule item:", error);
    throw new Error("일정 저장에 실패했습니다.");
  }
}

export async function deleteScheduleItem(id: string) {
  try {
    await adminDb.collection("schedules").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule item:", error);
    throw new Error("일정 삭제에 실패했습니다.");
  }
}
