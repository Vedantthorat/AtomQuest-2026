import { db } from '../config/firebase';
import { CollectionReference, DocumentData, Query, WhereFilterOp } from 'firebase-admin/firestore';

export type FirestoreDoc = DocumentData & { id: string; createdAt?: admin.FirebaseFirestore.Timestamp; updatedAt?: admin.FirebaseFirestore.Timestamp };

export const getCollection = (name: string): CollectionReference => db.collection(name);

export const getDoc = async <T extends FirestoreDoc>(collection: string, id: string): Promise<T | null> => {
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as T;
};

export const getAllDocs = async <T extends FirestoreDoc>(collection: string): Promise<T[]> => {
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const queryDocs = async <T extends FirestoreDoc>(
  collection: string,
  field: string,
  operator: WhereFilterOp,
  value: any
): Promise<T[]> => {
  const snapshot = await db.collection(collection).where(field, operator, value).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const createDoc = async <T extends DocumentData>(collection: string, data: T): Promise<string> => {
  const docRef = await db.collection(collection).add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

export const updateDoc = async <T extends DocumentData>(collection: string, id: string, data: Partial<T>): Promise<void> => {
  await db.collection(collection).doc(id).update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteDoc = async (collection: string, id: string): Promise<void> => {
  await db.collection(collection).doc(id).delete();
};

export const queryDocsMultiple = async <T extends FirestoreDoc>(
  collection: string,
  conditions: { field: string; operator: WhereFilterOp; value: any }[]
): Promise<T[]> => {
  let query: any = db.collection(collection);
  for (const { field, operator, value } of conditions) {
    query = query.where(field, operator, value);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const getDocsByField = async <T extends FirestoreDoc>(collection: string, field: string, value: any): Promise<T[]> => {
  return queryDocs<T>(collection, field, '==', value);
};

export const getDocByField = async <T extends FirestoreDoc>(collection: string, field: string, value: any): Promise<T | null> => {
  const docs = await queryDocs<T>(collection, field, '==', value);
  return docs.length > 0 ? docs[0] : null;
};

import * as admin from 'firebase-admin';