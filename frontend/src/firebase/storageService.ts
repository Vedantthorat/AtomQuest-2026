import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const firebaseStorage = {
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `profile_images/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  async deleteProfileImage(userId: string): Promise<void> {
    const storageRef = ref(storage, `profile_images/${userId}`);
    try {
      await deleteObject(storageRef);
    } catch (error) {
      console.log('No existing profile image to delete');
    }
  },

  async getProfileImageUrl(userId: string): Promise<string | null> {
    try {
      const storageRef = ref(storage, `profile_images/${userId}`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      return null;
    }
  }
};

export default firebaseStorage;