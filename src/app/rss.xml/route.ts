import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const baseUrl = 'https://justjun.com';

  let posts: any[] = [];
  try {
    const querySnapshot = await adminDb
      .collection("posts")
      .where("isDeleted", "==", false)
      .orderBy("createdAt", "desc")
      .get();

    posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error("RSS fetch error:", error);
  }

  const itemsXml = posts
    .map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/articles/${post.slug || post.id}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${post.slug || post.id}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${post.createdAt?.toDate ? post.createdAt.toDate().toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`)
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2000/atom">
  <channel>
    <title>Jun's Blog</title>
    <link>${baseUrl}</link>
    <description>개발 경험을 공유하는 블로그입니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
