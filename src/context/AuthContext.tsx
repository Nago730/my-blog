"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getIdToken
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// UI용 관리자 이메일 체크 (보완책: 실제 보안은 서버에서 처리됨)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // 토큰을 가져와서 쿠키에 저장 (Firebase Hosting/Next.js 관례에 따라 __session 이름 사용)
        const token = await getIdToken(user);
        Cookies.set("__session", token, { expires: 7, secure: true, sameSite: 'strict' });
      } else {
        Cookies.remove("__session");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await getIdToken(result.user);
      Cookies.set("__session", token, { expires: 7, secure: true, sameSite: 'strict' });
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === "auth/popup-blocked") {
        setError("팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.");
      } else if (err.code === "auth/network-request-failed") {
        setError("네트워크 연결이 아쉽습니다. 인터넷 상태를 확인해주세요.");
      } else {
        setError("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("__session");
      router.refresh(); // 미들웨어 상태 갱신을 위해 새로고침
    } catch (err) {
      console.error("Logout Error:", err);
      setError("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const isAdmin = user ? user.email === ADMIN_EMAIL : false;

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
