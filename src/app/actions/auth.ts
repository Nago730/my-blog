"use server";

import { cookies } from "next/headers";

export async function verifyOwnerPasscode(passcode: string): Promise<{ success: boolean; message?: string }> {
  if (!passcode) {
    return { success: false, message: "비밀번호를 입력해 주세요." };
  }

  const expectedPasscode = process.env.OWNER_PASSCODE || "1234";

  if (passcode.trim() === expectedPasscode.trim()) {
    const cookieStore = await cookies();
    cookieStore.set("owner_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return { success: true };
  }

  return { success: false, message: "비밀번호가 올바르지 않습니다." };
}

export async function checkIsOwner(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("owner_auth");
  return authCookie?.value === "true";
}

export async function ownerLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("owner_auth");
}
