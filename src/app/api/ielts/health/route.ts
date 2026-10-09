import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  const result: {
    firebase: { connected: boolean; projectId?: string; error?: string };
    gemini: { configured: boolean; hasKey: boolean };
  } = {
    firebase: { connected: false },
    gemini: { configured: false, hasKey: false },
  };

  // 1. Check Gemini Key
  const geminiKey = process.env.GEMINI_API_KEY;
  result.gemini.hasKey = !!geminiKey && geminiKey.trim().length > 10;
  result.gemini.configured = result.gemini.hasKey;

  // 2. Check Firebase Admin DB
  try {
    const db = getAdminDb();
    if (db) {
      result.firebase.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      // Ping Firestore by getting or listing a collection with limit 1
      await db.collection('ielts_users').limit(1).get();
      result.firebase.connected = true;
    } else {
      result.firebase.error = 'Firebase Admin DB 초기화 객체를 생성하지 못했습니다 (.env.local 환경 변수 확인 필요)';
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    result.firebase.error = msg;
    result.firebase.connected = false;
  }

  return NextResponse.json({
    success: result.firebase.connected,
    status: result,
  });
}
