import * as admin from 'firebase-admin';

// 이미 초기화된 앱이 있으면 재사용, 없으면 초기화
const app = admin.apps.length > 0
  ? admin.apps[0]
  : admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

export const adminDb = admin.firestore(app!);
export const adminAuth = admin.auth(app!);
