import { mockPosts } from "../data/posts";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

import CloudinaryImage from "@/components/CloudinaryImage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "글 목록 | Jun's Blog",
  description: "코드 한 줄의 고민부터 시스템 설계까지, 개발자로서 마주하는 모든 순간의 기록을 담은 블로그입니다.",
  alternates: {
    canonical: `/`,
  },
};

// 1시간마다 혹은 수정 시 갱시 (ISR)
export const revalidate = 3600;

// 서버 컴포넌트이므로 adminDb (서버 SDK)를 사용하여 API Key 이슈 회피
async function getPosts() {
  try {
    const querySnapshot = await adminDb
      .collection("posts")
      .where("isDeleted", "==", false)
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
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              모든 글 목록
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
              코드 한 줄에 담긴 고민부터 시스템 설계의 철학까지, 개발자로서 마주하는 모든 순간을 기록합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link href={`/articles/${post.slug || post.id}`} key={post.id} className="group cursor-pointer bg-white p-2 rounded-[2rem] border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 block relative">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-slate-100 mb-6 transition-transform">
                {post.images && post.images.length > 0 ? (
                  <CloudinaryImage
                    src={post.images[0].url}
                    alt={post.images[0].alt || post.title}
                    width={600}
                    height={375}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
                )}
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
