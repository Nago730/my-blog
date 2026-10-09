import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET /api/ielts/sessions?userId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId')?.trim() || 'jun';

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({
        success: false,
        isFallback: true,
        error: 'Firebase DB 환경 변수가 필요합니다.',
        sessions: [],
      });
    }

    const snapshot = await db
      .collection('ielts_users')
      .doc(userId)
      .collection('sessions')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const sessions = snapshot.docs.map(doc => doc.data());

    return NextResponse.json({
      success: true,
      userId,
      count: sessions.length,
      sessions,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '세션 조회 실패';
    return NextResponse.json({
      success: false,
      isFallback: true,
      error: msg,
      sessions: [],
    });
  }
}

// POST /api/ielts/sessions
// Body: { userId, session } or { userId, sessions: [...] }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = (body.userId || 'jun').trim();

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({
        success: false,
        isFallback: true,
        error: 'Firebase DB 환경 변수가 필요합니다.',
      });
    }

    const batch = db.batch();
    const userDocRef = db.collection('ielts_users').doc(userId);

    // 유저 메타데이터 갱신
    batch.set(userDocRef, {
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 단일 세션 또는 다중 세션(벌크 동기화)
    if (body.sessions && Array.isArray(body.sessions)) {
      for (const s of body.sessions) {
        if (!s.id) continue;
        const docRef = userDocRef.collection('sessions').doc(s.id);
        batch.set(docRef, {
          ...s,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } else if (body.session && body.session.id) {
      const docRef = userDocRef.collection('sessions').doc(body.session.id);
      batch.set(docRef, {
        ...body.session,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      return NextResponse.json({ success: false, error: '저장할 세션 데이터가 없습니다.' }, { status: 400 });
    }

    await batch.commit();

    return NextResponse.json({ success: true, message: '세션이 클라우드에 안전하게 동기화되었습니다.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '세션 저장 실패';
    return NextResponse.json({ success: false, isFallback: true, error: msg });
  }
}

// DELETE /api/ielts/sessions?userId=xxx&sessionId=yyy
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId')?.trim() || 'jun';
    const sessionId = searchParams.get('sessionId')?.trim();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: '삭제할 sessionId가 필요합니다.' }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ success: false, isFallback: true, error: 'Firebase DB 미구성' });
    }

    await db
      .collection('ielts_users')
      .doc(userId)
      .collection('sessions')
      .doc(sessionId)
      .delete();

    return NextResponse.json({ success: true, message: '세션이 삭제되었습니다.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '세션 삭제 실패';
    return NextResponse.json({ success: false, isFallback: true, error: msg });
  }
}
