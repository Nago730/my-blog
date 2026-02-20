import { MetadataRoute } from 'next'
import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://justjun.com'

  // Fetch posts from Firebase
  let posts: any[] = []
  try {
    const querySnapshot = await adminDb
      .collection("posts")
      .where("isDeleted", "==", false)
      .get();

    posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        slug: data.slug,
        id: doc.id,
        updatedAt: data.updatedAt
      }
    });
  } catch (error) {
    console.error("Sitemap fetch error:", error);
  }

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/articles/${post.slug || post.id}`,
    lastModified: post.updatedAt?.toDate ? post.updatedAt.toDate() : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
  ]
}
