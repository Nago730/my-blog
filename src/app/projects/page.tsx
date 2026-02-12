import { mockProjects } from "../../data/projects";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

import AdminOnly from "@/components/AdminOnly";
import CloudinaryImage from "@/components/CloudinaryImage";

export const revalidate = false;

async function getProjects() {
  try {
    const querySnapshot = await adminDb
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();

    const firebaseProjects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    if (firebaseProjects.length === 0) return mockProjects;
    return firebaseProjects;
  } catch (error) {
    console.error("Firebase admin fetch error, falling back to mock data:", error);
    return mockProjects;
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4">

        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              프로젝트 쇼케이스
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
              창의적인 아이디어를 코드로 구현한 저의 결과물들입니다.
            </p>
          </div>
          <AdminOnly>
            <Link
              href="/admin/projects/write"
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center space-x-2 hover:-translate-y-1 active:scale-95"
            >
              <span>🚀 프로젝트 등록</span>
            </Link>
          </AdminOnly>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {project.image?.url ? (
                  <CloudinaryImage
                    src={project.image.url}
                    alt={project.image.alt || project.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 backdrop-blur-[2px]">
                  <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">자세히 보기</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {tag}
                    </span>
                  ))}
                  {project.featured && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                      ★ FEATURED
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-indigo-600 font-bold text-sm hover:underline decoration-2 underline-offset-4">
                    상세 정보 보기 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
