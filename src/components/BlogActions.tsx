"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import PasscodeModal from "./PasscodeModal";

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
 * 본인 확인 (로그인 / 비밀번호 인증) 버튼
 */
export function LoginButton() {
  const { isOwner } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 group ${
          isOwner
            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        }`}
        title={isOwner ? "본인 인증됨 (클릭 시 확인)" : "본인 확인 (비밀번호 입력)"}
      >
        {isOwner ? (
          <ShieldCheck size={20} className="text-emerald-600" />
        ) : (
          <Lock size={20} className="group-hover:scale-110 transition-transform" />
        )}
      </button>

      <PasscodeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

/**
 * 로그아웃 버튼
 */
export function LogoutButton({ onClick }: { onClick?: () => void }) {
  const { ownerSignOut } = useAuth();

  const handleLogout = () => {
    ownerSignOut();
    if (onClick) onClick();
  };

  return (
    <NavActionButton
      onClick={handleLogout}
      variant="rose"
      icon={<LogOut size={16} />}
    >
      인증 해제 (로그아웃)
    </NavActionButton>
  );
}

