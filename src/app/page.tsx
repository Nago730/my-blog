'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { PenTool, Sparkles, Award, History, ArrowRight, Sun, Moon } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('ielts_theme_mode') as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        setTheme('light');
      }
    } catch {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('ielts_theme_mode', nextTheme);
    } catch {}
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isLight ? 'bg-white/85 border-slate-200/80 shadow-xs' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              IELTS Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors border flex items-center gap-1.5 text-xs font-semibold ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title={isLight ? '다크 모드로 전환' : '화이트 모드로 전환'}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">화이트 모드</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">다크 모드</span>
                </>
              )}
            </button>

            <Link
              href="/ielts"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>연습실 입장</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center gap-8">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
          isLight 
            ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' 
            : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI 기반 공식 IELTS Writing 트레이너</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none max-w-3xl ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          주제 생성부터 정밀 채점, <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
            Band 9.0 모범 답안
          </span>
          까지 한 곳에서.
        </h1>

        <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          매번 번거롭게 프롬프트를 복사할 필요 없이,
          실전 타이머 시험 작성부터 캠브리지 4대 공식 기준 채점 및 문장별 1:1 교정,
          나만의 에세이 히스토리 누적 관리까지 모두 원스톱으로 연습하세요.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/ielts"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm sm:text-base font-bold shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <PenTool className="w-4 h-4" />
            <span>라이팅 연습 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Core Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10 text-left">
          {/* Step 1 */}
          <div className={`rounded-2xl p-6 flex flex-col gap-3 relative transition-all ${
            isLight
              ? 'bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
              : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
            }`}>
              1
            </div>
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>실전 CBT 시험 환경</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Task 1 (20분 · 150단어) & Task 2 (40분 · 250단어) 자동 카운트다운 타이머와 실시간 단어 수 게이지, 자동 임시 저장 제공.
            </p>
          </div>

          {/* Step 2 */}
          <div className={`rounded-2xl p-6 flex flex-col gap-3 relative transition-all ${
            isLight
              ? 'bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
              : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-violet-50 border border-violet-100 text-violet-600' : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
            }`}>
              2
            </div>
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>4대 기준 AI 정밀 채점</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Task Response, Coherence, Lexical Resource, Grammatical Range 4대 영역 밴드 스코어 및 오류 문장 1:1 교정 리포트.
            </p>
          </div>

          {/* Step 3 */}
          <div className={`rounded-2xl p-6 flex flex-col gap-3 relative transition-all ${
            isLight
              ? 'bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
              : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-amber-50 border border-amber-100 text-amber-600' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}>
              3
            </div>
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Band 9.0 모범 답안 & 기록</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              원어민 고득점 모범 에세이와 고급 C1/C2 어휘 사전, 작성했던 모든 에세이 히스토리를 대시보드로 복습 및 관리.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isLight ? 'border-slate-200 text-slate-500 bg-white' : 'border-slate-900 text-slate-600'
      }`}>
        IELTS Writing Practice Suite with Gemini AI · Local Storage Secured
      </footer>
    </div>
  );
}
