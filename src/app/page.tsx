import { mockPosts } from "../data/posts";
import { mockProjects } from "../data/projects";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

async function getHomeData() {
  // DB 데이터 대신 mock 데이터를 강제로 사용하도록 설정
  return {
    posts: mockPosts.slice(0, 3),
    projects: mockProjects.filter(p => p.featured).slice(0, 2)
  };
}

export default async function Home() {
  const { posts, projects } = await getHomeData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            저의 디지털 공간에 오신 것을 환영합니다
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            이야기, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">코드</span> 그리고 삶을 나눕니다.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            웹 개발의 경계를 탐구하고 기술 세계를 여행하는 저의 여정을 공유하는 공간입니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/articles" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all transform hover:-translate-y-1 block text-center">
              최신 글 읽기
            </Link>
            <Link href="/projects" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition-all block text-center">
              프로젝트 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">추천 기사</h2>
              <p className="text-slate-500">디자인과 개발에 관한 엄선된 글들입니다.</p>
            </div>
            <Link href="/articles" className="text-indigo-600 font-semibold hover:underline decoration-2 underline-offset-4">
              모든 글 보기 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/articles/${post.id}`} key={post.id} className="group cursor-pointer block text-slate-900 no-underline">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 mb-6 transition-transform transform group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
                  {post.image && <img src={post.image} alt={post.title} className="w-full h-full object-cover" />}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {post.title}
                </h3>
                <p className="text-slate-500 line-clamp-2">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">프로젝트 쇼케이스</h2>
              <p className="text-xl text-slate-500 max-w-xl">창의적인 아이디어를 코드로 구현한 결과물입니다.</p>
            </div>
            <Link href="/projects" className="text-indigo-600 font-semibold hover:underline decoration-2 underline-offset-4">
              모든 프로젝트 보기 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.slice(0, 2).map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100/50 block">
                <div className="aspect-[16/9] overflow-hidden relative bg-slate-100">
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
                  )}
                  <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                    {project.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex items-center space-x-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                    <span>Selected Workspace</span>
                    <span className="w-1 h-1 bg-indigo-200 rounded-full"></span>
                    <span>2024</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-4 uppercase tracking-tight leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-lg line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-lg font-bold tracking-tight">내 블로그</span>
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-8">
            &copy; 2026 MyBlog by Nago730. Next.js와 Tailwind CSS로 제작되었습니다.
          </p>
          <div className="flex justify-center space-x-6 text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">Twitter</a>
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">GitHub</a>
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
