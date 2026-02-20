"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, loginWithGoogle, logout, isAdmin, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기 루틴
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center cursor-pointer group">
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">Jun's Blog</span>
          </Link>

          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">글 목록</Link>
          </div>

          <div className="flex items-center space-x-4 min-w-[80px] justify-end relative">
            {/* 1. 인증 로딩 상태 대응 */}
            {loading ? (
              <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : user ? (
              /* 2. 로그인 상태: 패널 드롭다운 방식 */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className="relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        className="w-8 h-8 rounded-full border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
                        alt="profile"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {user.displayName?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Panel Content */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{user.displayName || "사용자 님"}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      {isAdmin && (
                        <div className="mt-2 flex items-center space-x-1.5">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">Admin Authorized</span>
                        </div>
                      )}
                    </div>

                    <div className="p-1.5 space-y-1">
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/write"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                          >
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <span>새 포스트 작성</span>
                          </Link>
                          <Link
                            href="/admin/projects/write"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                          >
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </div>
                            <span>새 프로젝트 등록</span>
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all w-full text-left group"
                      >
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 3. 비로그인 상태 */
              <button
                onClick={loginWithGoogle}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-black transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
