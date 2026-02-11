"use client";

import { createPost } from "@/app/actions/posts";
import { useState, useMemo } from "react";
import Link from "next/link";
import MarkdownIt from "markdown-it";

export default function WritePage() {
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("개발");
  const [readTime, setReadTime] = useState("");
  const [image, setImage] = useState("");

  const md = useMemo(() => new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  }), []);

  const previewHtml = useMemo(() => {
    return md.render(content || "# 여기에 미리보기가 표시됩니다\n\n내용을 입력해 보세요.");
  }, [content, md]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsPending(true);
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Top Navigation / Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-slate-50 bg-white z-20 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/articles" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-bold">나가기</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            form="write-form"
            disabled={isPending || !title || !content}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2 ${isPending || !title || !content ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>발행 중...</span>
              </>
            ) : (
              <span>출간하기</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Editor Section */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Editor Area (50%) */}
        <section className="w-1/2 border-r border-slate-100 flex flex-col bg-white overflow-y-auto">
          <div className="p-8 md:p-12 space-y-8 max-w-4xl mx-auto w-full flex flex-col min-h-full pb-32">
            {/* Title Input inside the panel */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full text-4xl md:text-5xl font-extrabold text-slate-900 border-none outline-none placeholder:text-slate-200 bg-transparent shrink-0"
              required
              name="title"
              form="write-form"
            />

            <div className="h-1.5 w-16 bg-slate-900 rounded-full shrink-0"></div>

            <div className="space-y-6 shrink-0">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none"
                    name="category"
                    form="write-form"
                  >
                    <option value="개발">개발</option>
                    <option value="디자인">디자인</option>
                    <option value="커리어">커리어</option>
                    <option value="일상">일상</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">READ TIME</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="예: 5분 읽기"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    name="readTime"
                    form="write-form"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">DESCRIPTION</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="짧은 요약을 입력하세요"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  name="description"
                  form="write-form"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">REPRESENTATIVE IMAGE URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="이미지 URL을 입력하세요 (예: https://...)"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  name="image"
                  form="write-form"
                />
              </div>
            </div>

            <form id="write-form" action={createPost} onSubmit={handleSubmit} className="flex flex-col">
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="readTime" value={readTime} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="image" value={image} />

              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  // Auto-resize height to scroll with content
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="당신의 이야기를 들려주세요 (마크다운 지원)..."
                className="w-full border-none focus:outline-none resize-none font-mono text-slate-700 leading-relaxed text-lg placeholder:text-slate-300 overflow-hidden"
                name="content"
                required
                style={{ height: 'auto', minHeight: '600px' }}
                onFocus={(e) => {
                  // Initial resize on focus to ensure correct height if content exists
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </form>
          </div>
        </section>

        {/* Right: Preview Area (50%) */}
        <section className="w-1/2 bg-slate-50 overflow-y-auto hidden lg:block p-8 md:p-12 lg:p-16 border-l border-slate-100 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-32">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 break-all">
              {title || "제목을 입력하세요"}
            </h1>

            {description && (
              <p className="text-xl text-slate-500 leading-relaxed italic border-l-4 border-indigo-200 pl-6 mb-12">
                {description}
              </p>
            )}

            {image && (
              <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden mb-12 shadow-xl">
                <img
                  src={image}
                  alt="Post featured image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div
              className="prose prose-slate lg:prose-xl prose-indigo max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
