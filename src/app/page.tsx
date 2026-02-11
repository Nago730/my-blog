import { mockPosts } from "../data/posts";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Home() {
  const featuredPosts = mockPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      <Navbar />

      {/* Hero Section */}

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
            {featuredPosts.map((post) => (
              <div key={post.id} className="group cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 mb-6 transition-transform transform group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
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
                <p className="text-slate-600 line-clamp-2">
                  {post.description}
                </p>
              </div>
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
