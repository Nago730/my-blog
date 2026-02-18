"use client";

import { deletePost } from "@/app/actions/posts";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  id: string;
  title?: string;
}

export default function DeletePostButton({ id, title }: DeletePostButtonProps) {
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
      // 서버 액션(deletePost) 내부에서 redirect("/articles")를 호출하므로
      // 성공 시 이 이후 코드는 실행되지 않고 페이지 이동이 일어납니다.
    } catch (error) {
      // 넥스트 리다이렉트 에러는 에러 처리에서 제외
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-white/10 hover:bg-red-500/90 backdrop-blur-md border border-white/20 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/30 group/delbtn"
      title="삭제하기"
    >
      {isDeleting ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <span className="text-lg group-hover/delbtn:scale-110 transition-transform">🗑️</span>
      )}
    </button>
  );
}
