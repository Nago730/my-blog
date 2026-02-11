import { mockPosts } from "../../data/posts";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

import AdminOnly from "@/components/AdminOnly";

// 서버 컴포넌트이므로 adminDb (서버 SDK)를 사용하여 API Key 이슈 회피
async function getPosts() {
  try {
    const querySnapshot = await adminDb
      .collection("posts")
      .orderBy("createdAt", "desc")
      .get();

    const firebasePosts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    if (firebasePosts.length === 0) return mockPosts;
    return firebasePosts;
  } catch (error) {
    console.error("Firebase admin fetch error, falling back to mock data:", error);
    return mockPosts;
  }
}

export default async function ArticlesPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">모든 글 목록</h1>
            <p className="text-lg text-slate-600">제가 작성한 모든 기술 아티클과 생각을 모아두었습니다.</p>
          </div>
          <AdminOnly>
            <Link
              href="/admin/write"
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 inline-flex items-center space-x-2"
            >
              <span>✍️ 새 글 작성</span>
            </Link>
          </AdminOnly>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
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
