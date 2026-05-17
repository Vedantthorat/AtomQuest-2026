import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

const isConfigured = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;

if (isConfigured) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    console.log('✅ Firebase initialized');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, using mock mode:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured - using mock mode');
}

export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;

export const isFirebaseConfigured = () => !!admin.apps.length;