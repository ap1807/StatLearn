'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, type User, db } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(), // Firestore will ignore if already exists with setDoc(..., { merge: true })
          }, { merge: true });
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Sign-in popup was already open or request was cancelled.');
      } else if (error.code === 'auth/unauthorized-domain') {
        console.error('Sign-in error: Unauthorized domain. Please add the current domain to the authorized domains list in the Firebase Console (Authentication > Settings > Authorized domains). Current domain:', window.location.hostname);
        alert(`Sign-in error: Unauthorized domain (${window.location.hostname}). Please add this domain to your Firebase Console authorized domains.`);
      } else {
        console.error('Sign-in error:', error.code, error.message);
        alert(`Sign-in error: ${error.message}`);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
}
