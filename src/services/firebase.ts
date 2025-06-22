// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getFirestore, doc, getDoc, collection, getDocs} from 'firebase/firestore'
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp)

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Admin access control functions
export const checkAdminAccess = async (user: User): Promise<boolean> => {
  try {
    // Check if user email is in the allowed admins collection
    const adminDoc = await getDoc(doc(db, 'admins', user.email || ''));
    
    if (adminDoc.exists()) {
      return true;
    }
    
    // Also check the allowed_emails collection for backward compatibility
    const allowedEmailsDoc = await getDoc(doc(db, 'allowed_emails', user.email || ''));
    
    return allowedEmailsDoc.exists();
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

export const getAllowedAdmins = async (): Promise<string[]> => {
  try {
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    const allowedEmailsSnapshot = await getDocs(collection(db, 'allowed_emails'));
    
    const adminEmails = adminsSnapshot.docs.map(doc => doc.id);
    const allowedEmails = allowedEmailsSnapshot.docs.map(doc => doc.id);
    
    return [...new Set([...adminEmails, ...allowedEmails])];
  } catch (error) {
    console.error('Error getting allowed admins:', error);
    return [];
  }
};