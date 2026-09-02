"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onIdTokenChanged,
  getIdToken
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { verifyOwnerPasscode, checkIsOwner, ownerLogout } from "@/app/actions/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isOwner: boolean;
  verifyPasscode: (passcode: string) => Promise<{ success: boolean; message?: string }>;
  ownerSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check Owner Auth status from cookie/server
    checkIsOwner().then((status) => {
      setIsOwner(status);
    });

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const token = await user.getIdToken();
          Cookies.set("__session", token, { expires: 7, secure: true, sameSite: 'strict' });
        } catch (err) {
          console.error("Token refresh error:", err);
          logout();
        }
      } else {
        setUser(null);
        Cookies.remove("__session");
      }
      setLoading(false);
    });

    const tokenCheckInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(false);
        } catch (err) {
          console.error("Session expired or invalid:", err);
          logout();
        }
      }
    }, 10 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const handleVerifyPasscode = async (passcode: string) => {
    const res = await verifyOwnerPasscode(passcode);
    if (res.success) {
      setIsOwner(true);
    }
    return res;
  };

  const handleOwnerSignOut = async () => {
    await ownerLogout();
    setIsOwner(false);
    router.refresh();
  };

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
      await ownerLogout();
      setIsOwner(false);
      Cookies.remove("__session");
      router.refresh();
    } catch (err) {
      console.error("Logout Error:", err);
      setError("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const isAdmin = isOwner || (user ? user.email === ADMIN_EMAIL : false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithGoogle,
        logout,
        isAdmin,
        isOwner,
        verifyPasscode: handleVerifyPasscode,
        ownerSignOut: handleOwnerSignOut,
      }}
    >
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
