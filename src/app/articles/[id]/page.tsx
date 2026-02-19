import { mockPosts } from "../../../data/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { adminDb } from "@/lib/firebase-admin";
import ImageGallery from "@/components/ImageGallery";
import AdminOnly from "@/components/AdminOnly";
import DeletePostButton from "@/components/DeletePostButton";

// 1시간마다 혹은 수정 시 갱신 (ISR)
export const revalidate = 3600;

// 빌드 시점에 정적 페이지 미리 생성 (SSG)
export async function generateStaticParams() {
  try {
    const querySnapshot = await adminDb
      .collection("posts")
      .where("isDeleted", "==", false)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

async function getPost(id: string) {
  try {
    const docSnap = await adminDb.collection("posts").doc(id).get();

    if (docSnap.exists) {
      const data = docSnap.data();
      // Soft Delete된 문서라면 null 반환 (상세 페이지에서 notFound 트리거)
      if (data?.isDeleted === true) return null;

      return { id: docSnap.id, ...data } as any;
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

  const images = post.images || [];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">

      <main className="pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-4">
          {/* Metadata */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <Link href="/articles" className="text-indigo-600 font-semibold text-sm hover:underline">
                ← 모든 글 목록으로 돌아가기
              </Link>
              <AdminOnly>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/edit/${post.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center space-x-1"
                  >
                    <span>✏️ 수정</span>
                  </Link>
                  <DeletePostButton id={post.id} title={post.title} />
                </div>
              </AdminOnly>
            </div>
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


          {/* New Interactive Gallery */}
          <div className="mb-16">
            <ImageGallery images={images} title={post.title} />
          </div>

          {/* Content */}
          <div
            className="prose prose-slate lg:prose-xl prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />


        </article>
      </main>

      {/* Recommended Articles Section could go here */}
    </div >
  );
}
