"use client";

import { createPost } from "@/app/actions/posts";
import { getCloudinarySignature } from "@/app/actions/cloudinary";
import { useState, useMemo } from "react";
import Link from "next/link";
import MarkdownIt from "markdown-it";
import Script from "next/script";

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function WritePage() {
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [category, setCategory] = useState("개발");
  const [readTime, setReadTime] = useState("");
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // 자동 슬러그 생성 (영문, 숫자, 하이픈만 허용)
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleUpload = async () => {
    try {
      const signatureData = await getCloudinarySignature("signed_posts");
      const { signature, timestamp, apiKey, cloudName, uploadPreset } = signatureData;

      if (typeof window !== 'undefined' && window.cloudinary) {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName: cloudName,
            apiKey: apiKey,
            uploadSignatureTimestamp: timestamp,
            uploadSignature: (callback: any, paramsToSign: any) => {
              callback(signature);
            },
            uploadPreset: uploadPreset,
            sources: ["local"],
            maxFiles: 10,
            multiple: true,
            clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
            theme: "minimal",
          },
          (error: any, result: any) => {
            if (!error && result && result.event === "success") {
              const uploadedUrl = result.info.secure_url;
              const uploadedPublicId = result.info.public_id;
              setImages(prev => [...prev, { url: uploadedUrl, publicId: uploadedPublicId }]);
            }
            if (error) {
              console.error("Cloudinary Widget Error:", error);
            }
          }
        );
        widget.open();
      } else {
        alert("이미지 업로더 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error("Cloudinary Auth Failed:", err);
      alert("업로드 권한을 확인하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Top Navigation / Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-slate-50 bg-white z-20 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 flex items-center space-x-2">
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
              onChange={handleTitleChange}
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
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">SLUG (URL)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="nextjs-seo-guide"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    name="slug"
                    form="write-form"
                    required
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">DESCRIPTION (SEO)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="검색 결과 요약 (150자 내외)"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    name="description"
                    form="write-form"
                    required
                  />
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
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">OG IMAGE URL (OPTIONAL)</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="미입력 시 첫 번째 업로드 이미지 사용"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  name="ogImage"
                  form="write-form"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block font-mono">IMAGES</label>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>이미지 업로드 (최대 10장)</span>
                  </button>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-sm flex items-center justify-center">
                          <img src={img.url} alt={`Upladed ${index}`} className="max-w-full max-h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-900 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                            title="삭제"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md uppercase tracking-tighter">Cover</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form id="write-form" action={createPost} onSubmit={handleSubmit} className="flex flex-col">
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="ogImage" value={ogImage} />
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="readTime" value={readTime} />
              <input type="hidden" name="description" value={description} />

              {/* 다중 이미지 전달 */}
              {images.map((img, idx) => (
                <div key={idx}>
                  <input type="hidden" name="images[]" value={img.url} />
                  <input type="hidden" name="publicIds[]" value={img.publicId} />
                </div>
              ))}

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

            {images.length > 0 && (
              <div className="w-full mb-12 space-y-4">
                <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-xl">
                  <img
                    src={images[0].url}
                    alt="Post cover image"
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(1).map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md">
                        <img src={img.url} alt={`Gallery item ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              className="prose prose-slate lg:prose-xl prose-indigo max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </section>

        {/* Cloudinary Script */}
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="lazyOnload"
        />
      </main>
    </div>
  );
}
