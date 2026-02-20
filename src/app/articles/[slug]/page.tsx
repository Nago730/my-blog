import { mockPosts } from "../../../data/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { adminDb } from "@/lib/firebase-admin";
import ImageGallery from "@/components/ImageGallery";
import AdminOnly from "@/components/AdminOnly";
import { EditPostButton, DeletePostButton } from "@/components/BlogActions";
import CodeBlockCopy from "@/components/CodeBlockCopy";
import { Metadata } from "next";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { ArrowLeft } from "lucide-react";

// 1시간마다 혹은 수정 시 갱인 (ISR)
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.ogImage || (post.images?.[0]?.url) || "/default-og.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.ogImage || (post.images?.[0]?.url) || "/default-og.svg"],
    },
  };
}

// 빌드 시점에 정적 페이지 미리 생성 (SSG)
export async function generateStaticParams() {
  try {
    const querySnapshot = await adminDb
      .collection("posts")
      .where("isDeleted", "==", false)
      .get();

    return querySnapshot.docs.map((doc) => ({
      slug: doc.data().slug || doc.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

async function getPost(slug: string) {
  try {
    // 1. 슬러그로 먼저 조회
    const querySnapshot = await adminDb
      .collection("posts")
      .where("slug", "==", slug)
      .where("isDeleted", "==", false)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as any;
    }

    // 2. 슬러그가 없거나 못 찾은 경우 ID로도 시도 (하위 호환성)
    const docSnap = await adminDb.collection("posts").doc(slug).get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.isDeleted === true) return null;
      return { id: docSnap.id, ...data } as any;
    }

    return mockPosts.find((p) => p.slug === slug || p.id === slug);
  } catch (error) {
    console.error("Firebase admin fetch error:", error);
    return mockPosts.find((p) => p.slug === slug);
  }
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
      const langLabel = lang || 'code';
      const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      const header = '<span class="code-block-header">' +
        '<span class="code-block-lang">' + langLabel + '</span>' +
        '<button class="code-copy-btn" type="button">' + copyIcon + '</button>' +
        '</span>';

      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="code-block-wrapper">' + header +
            '<code class="hljs language-' + lang + '">' +
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
            '</code></pre>';
        } catch (__) { }
      }

      return '<pre class="code-block-wrapper">' + header +
        '<code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  });

  const post = await getPost(slug);

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
              <Link href="/" className="text-indigo-600 font-semibold text-sm hover:underline">
                ← 모든 글 목록으로 돌아가기
              </Link>
              <AdminOnly>
                <div className="flex items-center space-x-2">
                  <EditPostButton id={post.id} />
                  <DeletePostButton id={post.id} title={post.title} variant="full" />
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
          <CodeBlockCopy />


        </article>
      </main>

      {/* Recommended Articles Section could go here */}
    </div >
  );
}
