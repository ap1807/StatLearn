'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Camera, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useNotifications } from '@/components/NotificationProvider';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      
      const fetchUserData = async () => {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
        updatedAt: new Date()
      });
      
      addNotification({
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
        severity: 'low'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mb-8 border border-outline-variant/10">
          <User className="w-10 h-10 text-primary/40" />
        </div>
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-4">Access Your Profile</h1>
        <p className="text-on-surface-variant max-w-md mb-10 leading-relaxed">
          Please sign in to view and manage your account settings and personal information.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">Account Settings</h1>
          <p className="text-on-surface-variant">Manage your profile and personal preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-xl">
                {photoURL ? (
                  <Image 
                    src={photoURL} 
                    alt={displayName || 'User'} 
                    width={128} 
                    height={128} 
                    className="object-cover w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
                    {displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg border-2 border-surface-container-lowest">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-bold text-on-surface mb-1">{displayName || 'Traveler'}</h2>
              <p className="text-on-surface-variant flex items-center justify-center md:justify-start gap-2 mb-4">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {userData?.createdAt?.toDate().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) || 'Recently'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Account
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Profile Photo URL</label>
                <input 
                  type="text" 
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Info */}
        <div className="glass-panel p-8 rounded-[2.5rem] border-dashed border-2 border-outline-variant/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-tertiary-container/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Data Privacy & Security</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your profile data and travel analyses are securely stored in our encrypted Firestore database. We use industry-standard Firebase Authentication to ensure only you can access your personal intelligence dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
