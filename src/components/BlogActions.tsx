"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { deletePost } from "@/app/actions/posts";
import { useState } from "react";
import { User, LogIn, FileText, PlusCircle, LogOut, Pencil, Trash2 } from "lucide-react";

// 공통 버튼 스타일 상수
const BUTTON_BASE = "flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * 네비게이션 드롭다운용 공통 버튼 스타일 (디자인 완전 복구)
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
 * 로그인 버튼 (심플 아이콘 방식)
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
 * 새 포스트 작성 버튼 (텍스트 및 디자인 복구)
 */
export function CreatePostButton({ onClick }: { onClick?: () => void }) {
  return (
    <NavActionButton
      href="/admin/write"
      onClick={onClick}
      icon={<FileText size={16} />}
    >
      새 포스트 작성
    </NavActionButton>
  );
}

/**
 * 새 프로젝트 등록 버튼 (디자인 복구)
 */
export function CreateProjectButton({ onClick }: { onClick?: () => void }) {
  return (
    <NavActionButton
      href="/admin/projects/write"
      onClick={onClick}
      icon={<PlusCircle size={16} />}
    >
      새 프로젝트 등록
    </NavActionButton>
  );
}

/**
 * 로그아웃 버튼 (디자인 복구)
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

/**
 * 글 수정 버튼
 */
export function EditPostButton({ id, variant = "full" }: { id: string; variant?: "full" | "minimal" }) {
  if (variant === "minimal") {
    return (
      <Link
        href={`/admin/edit/${id}`}
        className="p-2 bg-white hover:bg-indigo-600 text-slate-900 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-xl hover:shadow-indigo-500/40 border border-slate-100 group"
        title="수정하기"
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil size={18} className="group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  return (
    <Link
      href={`/admin/edit/${id}`}
      className={`${BUTTON_BASE} px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all shadow-sm hover:shadow-md`}
    >
      <Pencil size={14} />
      <span>수정</span>
    </Link>
  );
}

/**
 * 글 삭제 버튼 (통일된 디자인)
 */
export function DeletePostButton({ id, title, variant = "minimal" }: { id: string; title?: string; variant?: "minimal" | "full" }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmMessage = title
      ? `"${title}" 글을 정말로 삭제하시겠습니까?`
      : "이 글을 정말로 삭제하시겠습니까?";

    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await deletePost(id);
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
        console.error(error);
        alert("삭제 중 오류가 발생했습니다.");
        setIsDeleting(false);
      }
    }
  };

  if (variant === "minimal") {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 bg-white hover:bg-rose-600 text-slate-900 hover:text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-rose-500/40 border border-slate-100 group"
        title="삭제하기"
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-slate-200 border-t-rose-600 rounded-full animate-spin" />
        ) : (
          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`${BUTTON_BASE} px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all shadow-sm hover:shadow-md`}
    >
      {isDeleting ? (
        <div className="w-3 h-3 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
      <span>삭제</span>
    </button>
  );
}
