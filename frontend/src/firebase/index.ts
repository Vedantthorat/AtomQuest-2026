export { default as firebaseApp } from './config';
export { auth, db, storage } from './config';
export { default as firebaseAuth, firebaseAuth as authService } from './authService';
export { default as firestoreDb, firestoreDb as dbService } from './dbService';
export { default as firebaseStorage, firebaseStorage as storageService } from './storageService';

export type { RegisterData, LoginData } from './authService';