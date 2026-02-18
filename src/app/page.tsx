import { mockPosts } from "../data/posts";
import { mockProjects } from "../data/projects";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

async function getHomeData() {
  // DB 데이터 대신 mock 데이터를 강제로 사용하도록 설정
  return {
    posts: mockPosts.slice(0, 9),
  };
}

export default async function Home() {
  const { posts } = await getHomeData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Posts Section */}
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-2">모든 기사</h2>
              <p className="text-slate-500 text-lg">디자인과 개발에 관한 엄선된 글들입니다.</p>
            </div>
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

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="group">
              <span className="text-xl font-syne font-light tracking-[0.2em] text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">Jun's Blog</span>
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-8">
            &copy; 2026 Jun's Blog. 고민하고 기록하며 함께 성장하는 공간입니다.
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

