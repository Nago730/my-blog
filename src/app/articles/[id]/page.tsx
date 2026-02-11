import { mockPosts } from "../../../data/posts";
import Navbar from "../../../components/Navbar";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function ArticleDetail({ params }: { params: { id: string } }) {
  const post = mockPosts.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <article className="max-w-3xl mx-auto">
          {/* Metadata */}
          <div className="mb-8">
            <Link href="/articles" className="text-indigo-600 font-semibold text-sm hover:underline mb-8 inline-block">
              ← 모든 글 목록으로 돌아가기
            </Link>
            <div className="flex items-center space-x-2 text-slate-500 text-sm mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">
                {post.category}
              </span>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed italic border-l-4 border-indigo-200 pl-6">
              {post.description}
            </p>
          </div>

          {/* Featured Image Placeholder */}
          <div className="aspect-[21/9] bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl mb-12 flex items-center justify-center text-4xl overflow-hidden">
            {/* post.image가 있다면 여기에 표시 */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
            🎨
          </div>

          {/* Content */}
          <div className="prose prose-slate lg:prose-xl prose-indigo max-w-none">
            {/* 
                실제 마크다운 렌더러를 사용하는 것이 좋지만, 
                현재는 간단히 줄바꿈을 처리하여 출력합니다.
            */}
            <div className="whitespace-pre-line text-slate-700 leading-8">
              {post.content}
            </div>
          </div>

          {/* Footer of the article */}
          <div className="mt-20 pt-10 border-t border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                  👨‍💻
                </div>
                <div>
                  <p className="font-bold">Nago730</p>
                  <p className="text-sm text-slate-500">끊임없이 탐구하는 개발자</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all">
                글 공유하기
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* Recommended Articles Section could go here */}
    </div>
  );
}
