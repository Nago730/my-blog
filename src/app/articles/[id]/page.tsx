import { mockPosts } from "../../../data/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { adminDb } from "@/lib/firebase-admin";
import CloudinaryImage from "@/components/CloudinaryImage";

async function getPost(id: string) {
  try {
    const docSnap = await adminDb.collection("posts").doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    }

    return mockPosts.find((p) => p.id === id);
  } catch (error) {
    console.error("Firebase admin fetch error:", error);
    return mockPosts.find((p) => p.id === id);
  }
}

export default async function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  });

  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  // 데이터의 앞뒤 공백을 제거하고, 행별 들여쓰기가 있는 경우를 대비해 처리할 수 있습니다.
  const cleanContent = typeof post.content === 'string' ? post.content.trim() : '';
  const htmlContent = md.render(cleanContent);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">

      <main className="pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-4">
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

          {/* Featured Image */}
          <div className="aspect-[21/9] bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl mb-12 flex items-center justify-center text-4xl overflow-hidden relative shadow-2xl shadow-indigo-100/50">
            {post.image?.url ? (
              <CloudinaryImage
                src={post.image.url}
                alt={post.image.alt || post.title}
                width={1200}
                height={514}
                priority
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
                🎨
              </>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-slate lg:prose-xl prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

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
    </div >
  );
}
