import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export function getAdminDb(): Firestore | null {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // 양 끝 따옴표 제거
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    // 줄바꿈 문자 정규화 (\n 문자열을 실제 줄바꿈으로 변환)
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[Firebase Admin] Firebase 환경 변수가 완전히 설정되지 않았습니다. (ProjectID, ClientEmail, PrivateKey 필요)');
    return null;
  }

  try {
    const appName = `ielts-admin-${projectId}`;
    const existingApp = getApps().find(a => a.name === appName);
    if (existingApp) {
      return getFirestore(existingApp);
    }

    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, appName);

    return getFirestore(app);
  } catch (error) {
    console.error('[Firebase Admin] 초기화 실패:', error);
    return null;
  }
}
