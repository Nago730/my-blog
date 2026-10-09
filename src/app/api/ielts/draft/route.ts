import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET /api/ielts/draft?userId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId')?.trim() || 'jun';

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ success: false, isFallback: true, error: 'Firebase DB 미구성', draft: null });
    }

    const doc = await db.collection('ielts_users').doc(userId).collection('meta').doc('draft').get();
    if (!doc.exists) {
      return NextResponse.json({ success: true, draft: null });
    }

    return NextResponse.json({ success: true, draft: doc.data() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '임시 저장 불러오기 실패';
    return NextResponse.json({ success: false, isFallback: true, error: msg, draft: null });
  }
}

// POST /api/ielts/draft
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = (body.userId || 'jun').trim();
    const { draft } = body;

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ success: false, isFallback: true, error: 'Firebase DB 미구성' });
    }

    await db.collection('ielts_users').doc(userId).collection('meta').doc('draft').set({
      ...draft,
      savedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, message: '임시 저장이 클라우드에 동기화되었습니다.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '임시 저장 실패';
    return NextResponse.json({ success: false, isFallback: true, error: msg });
  }
}
