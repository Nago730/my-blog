"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { LoginButton, CreatePostButton, CreateProjectButton, LogoutButton } from "./BlogActions";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin, loading } = useAuth();
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
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
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
                          <CreatePostButton onClick={() => setIsMenuOpen(false)} />
                          <CreateProjectButton onClick={() => setIsMenuOpen(false)} />
                        </>
                      )}

                      <LogoutButton onClick={() => setIsMenuOpen(false)} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 3. 비로그인 상태 */
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
