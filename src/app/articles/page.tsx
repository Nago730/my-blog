import { mockPosts } from "../../data/posts";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">모든 글 목록</h1>
          <p className="text-lg text-slate-600">제가 작성한 모든 기술 아티클과 생각을 모아두었습니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPosts.map((post) => (
            <Link href={`/articles/${post.id}`} key={post.id} className="group cursor-pointer bg-white p-2 rounded-[2rem] border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-slate-100 mb-6 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-6">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
