"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut } from "lucide-react";

/**
 * 네비게이션 드롭다운용 공통 버튼 스타일
 */
function NavActionButton({
  children,
  onClick,
  href,
  icon,
  variant = "indigo"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon: React.ReactNode;
  variant?: "indigo" | "rose";
}) {
  const containerClasses = variant === "indigo"
    ? "flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group w-full"
    : "flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all w-full text-left group";

  const iconWrapperClasses = variant === "indigo"
    ? "w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors"
    : "w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-rose-100 transition-colors";

  const iconClasses = variant === "indigo"
    ? "w-4 h-4 text-slate-400 group-hover:text-indigo-600"
    : "w-4 h-4 text-slate-400 group-hover:text-rose-600";

  const content = (
    <>
      <div className={iconWrapperClasses}>
        <div className={iconClasses}>
          {icon}
        </div>
      </div>
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={containerClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={containerClasses}>
      {content}
    </button>
  );
}

/**
 * 로그인 버튼
 */
export function LoginButton() {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <button
      onClick={loginWithGoogle}
      disabled={loading}
      className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-700 transition-all active:scale-95 disabled:opacity-50 group"
      title="로그인하기"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      ) : (
        <User size={24} className="group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}

/**
 * 로그아웃 버튼
 */
export function LogoutButton({ onClick }: { onClick?: () => void }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onClick) onClick();
  };

  return (
    <NavActionButton
      onClick={handleLogout}
      variant="rose"
      icon={<LogOut size={16} />}
    >
      로그아웃
    </NavActionButton>
  );
}

