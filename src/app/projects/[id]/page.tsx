import { mockProjects } from "../../../data/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

async function getProject(id: string) {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    }

    return mockProjects.find((p) => p.id === id);
  } catch (error) {
    console.error("Firebase fetch error:", error);
    return mockProjects.find((p) => p.id === id);
  }
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  });
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const cleanContent = typeof project.detailContent === 'string' ? project.detailContent.trim() : '';
  const htmlContent = md.render(cleanContent);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <Link href="/projects" className="text-indigo-600 font-semibold text-sm hover:underline mb-8 inline-block">
              ← 모든 프로젝트 목록으로 돌아가기
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
              {project.featured && (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                  ★ FEATURED
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {project.title}
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </div>

          {/* Project Preview Image */}
          <div className="aspect-video bg-white rounded-[2.5rem] border border-slate-200 mb-16 relative overflow-hidden shadow-2xl shadow-slate-200/50">
            {project.image ? (
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5" />
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🚀
                </div>
              </>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <section
                className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm prose prose-slate lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">프로젝트 정보</h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-tighter">역할</p>
                    <p className="font-semibold">{project.role || "Fullstack Developer"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-tighter">기간</p>
                    <p className="font-semibold">{project.period || "2024.01 - 진행 중"}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all text-sm">
                        <span>라이브 데모 보기</span>
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all text-sm">
                        <span>GitHub 저장소</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-4">함께 이야기하기</h3>
                <p className="text-sm text-indigo-700 leading-relaxed mb-6">이 프로젝트에 대해 궁금한 점이 있거나 피드백을 주고 싶으시면 언제든 연락주세요!</p>
                <Link href="/about" className="text-indigo-600 font-bold text-xs hover:underline">성장하는 개발자 정보 보기 →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-white mt-auto text-center">
        <p className="text-slate-400 text-sm italic">
          끊임없이 도전하고 혁신하는 결과물을 만듭니다.
        </p>
      </footer>
    </div>
  );
}
