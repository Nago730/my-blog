"use client";

import { createProject } from "@/app/actions/projects";
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

export default function ProjectWritePage() {
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [github, setGithub] = useState("");
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [featured, setFeatured] = useState(false);

  const md = useMemo(() => new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  }), []);

  const previewHtml = useMemo(() => {
    return md.render(content || "# 프로젝트 상세 내용 미리보기가 여기에 표시됩니다.");
  }, [content, md]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsPending(true);
  };

  const handleUpload = async () => {
    try {
      const signatureData = await getCloudinarySignature("signed_projects");
      const { signature, timestamp, apiKey, cloudName, uploadPreset } = signatureData;

      if (typeof window !== 'undefined' && window.cloudinary) {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName,
            apiKey,
            uploadSignatureTimestamp: timestamp,
            uploadSignature: (callback: any, paramsToSign: any) => {
              callback(signature);
            },
            uploadPreset,
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
          }
        );
        widget.open();
      }
    } catch (err) {
      console.error("Cloudinary Auth Failed:", err);
      alert("업로드 권한 확인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden text-slate-900">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-slate-50 bg-white z-20 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/projects" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-bold">나가기</span>
          </Link>
          <span className="text-slate-200">|</span>
          <span className="font-bold text-slate-600">새 프로젝트 등록</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            form="project-form"
            disabled={isPending || !title || !content}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2 ${isPending || !title || !content ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? "저장 중..." : "프로젝트 저장하기"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <section className="w-1/2 border-r border-slate-100 flex flex-col bg-white overflow-y-auto">
          <div className="p-8 md:p-12 space-y-8 max-w-4xl mx-auto w-full flex flex-col min-h-full pb-32">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="프로젝트 제목"
              className="w-full text-4xl font-extrabold border-none outline-none placeholder:text-slate-200"
              name="title"
              form="project-form"
              required
            />

            <div className="h-1.5 w-16 bg-slate-900 rounded-full shrink-0"></div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">SHORT DESCRIPTION</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="프로젝트 요약 설명"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  name="description"
                  form="project-form"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">TAGS (콤마로 구분)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Next.js, React, Firebase"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    name="tags"
                    form="project-form"
                  />
                </div>
                <div className="flex items-end pb-1 px-2">
                  <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      name="featured"
                      form="project-form"
                    />
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">FEATURED PROJECT</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">DEMO LINK</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    name="link"
                    form="project-form"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">GITHUB LINK</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    name="github"
                    form="project-form"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">IMAGES</label>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>이미지 업로드 (최대 10장)</span>
                  </button>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-sm flex items-center justify-center">
                          <img src={img.url} alt={`Uploaded ${index}`} className="max-w-full max-h-full object-contain" />
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

            <form id="project-form" action={createProject} onSubmit={handleSubmit} className="flex flex-col">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="프로젝트 상세 설명 (마크다운 지원)..."
                className="w-full border-none focus:outline-none resize-none font-mono text-slate-700 leading-relaxed text-lg placeholder:text-slate-300 min-h-[600px] overflow-hidden bg-transparent"
                name="content"
                required
                style={{ height: 'auto' }}
                onFocus={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              {images.map((img, idx) => (
                <div key={idx}>
                  <input type="hidden" name="images[]" value={img.url} />
                  <input type="hidden" name="publicIds[]" value={img.publicId} />
                </div>
              ))}
            </form>
          </div>
        </section>

        {/* Right: Preview */}
        <section className="w-1/2 bg-slate-50 overflow-y-auto hidden lg:block p-8 md:p-12 lg:p-16 border-l border-slate-100 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-32">
            <div className="flex items-center space-x-3 mb-6">
              {tags.split(",").filter(t => t.trim()).map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold">{tag.trim()}</span>
              ))}
              {featured && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">★ Featured</span>}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 break-all">
              {title || "프로젝트 제목"}
            </h1>

            <p className="text-xl text-slate-500 mb-10 leading-relaxed underline decoration-indigo-200 underline-offset-8">
              {description || "짧은 요약 설명이 여기에 표시됩니다."}
            </p>

            {images.length > 0 && (
              <div className="w-full mb-12 space-y-4">
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl">
                  <img src={images[0].url} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(1).map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md">
                        <img src={img.url} alt={`Gallery item ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-12">
              {link && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">🔗</div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Demo Link</p>
                    <p className="text-sm font-bold text-indigo-600 truncate">{link}</p>
                  </div>
                </div>
              )}
              {github && (
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center">🐙</div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">GitHub</p>
                    <p className="text-sm font-bold truncate">{github}</p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="prose prose-slate lg:prose-xl prose-indigo max-w-none break-words border-t border-slate-100 pt-12"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </section>
      </main>

      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
    </div>
  );
}
