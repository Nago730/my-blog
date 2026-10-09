import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let clientApp: FirebaseApp | null = null;
let clientDb: Firestore | null = null;

export function getClientDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (clientDb) return clientDb;

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }

  try {
    clientApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    clientDb = getFirestore(clientApp);
    return clientDb;
  } catch (error) {
    console.error('[Firebase Client] 초기화 실패:', error);
    return null;
  }
}
