'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Calendar, MapPin, Plane, Clock, TrendingUp, AlertCircle, ChevronRight, LayoutDashboard, Database } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/components/NotificationProvider';

interface SavedAnalysis {
  id: string;
  uid: string;
  distance: number;
  classType: string;
  depDelay: number;
  arrDelay: number;
  travelType: string;
  result: {
    satisfactionScore: number;
    riskLevel: string;
    keyInsights: string[];
    recommendations: string[];
  };
  createdAt: any;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { addNotification } = useNotifications();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const path = 'analyses';
    const q = query(
      collection(db, path),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAnalyses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedAnalysis[];
      setAnalyses(fetchedAnalyses);
      setLoading(false);
    }, (error) => {
      // Handle the case where the user might not have permission yet or other issues
      if (error.code === 'permission-denied') {
        console.warn('Permission denied to fetch analyses. This might be expected if the user just signed in.');
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Derived loading state
  const isDataLoading = user ? loading : false;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    const path = `analyses/${id}`;
    try {
      await deleteDoc(doc(db, 'analyses', id));
      addNotification({
        title: 'Analysis Deleted',
        message: 'The analysis has been removed from your dashboard.',
        severity: 'low'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
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
          <LayoutDashboard className="w-10 h-10 text-primary/40" />
        </div>
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-4">Your Intelligence Dashboard</h1>
        <p className="text-on-surface-variant max-w-md mb-10 leading-relaxed">
          Sign in to access your saved travel analyses, track satisfaction trends, and manage your strategic insights in one place.
        </p>
        <button
          onClick={signIn}
          className="sky-gradient text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          Sign In to Access Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-on-surface">My Analyses</h1>
          </div>
          <p className="text-on-surface-variant">Manage your saved strategic travel insights and simulations.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/10 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest leading-none mb-1">Total Saved</span>
              <span className="text-xl font-bold text-on-surface leading-none">{analyses.length}</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/20 mx-1" />
            <Database className="w-5 h-5 text-primary/60" />
          </div>
          <Link 
            href="/analyze"
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            New Analysis
          </Link>
        </div>
      </div>

      {isDataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel h-64 rounded-3xl animate-pulse bg-surface-container-low/50" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="glass-panel p-16 rounded-[2.5rem] text-center flex flex-col items-center border-dashed border-2 border-outline-variant/30">
          <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-outline-variant" />
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface mb-2">No Saved Analyses</h3>
          <p className="text-on-surface-variant max-w-sm mb-8">
            You haven&apos;t saved any travel analyses yet. Start by simulating a travel scenario to see your insights here.
          </p>
          <Link 
            href="/analyze"
            className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            Create your first analysis <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {analyses.map((analysis) => (
              <motion.div
                key={analysis.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-panel p-6 rounded-3xl group hover:border-primary/30 transition-all relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-outline" />
                      <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                        {analysis.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">
                      {analysis.travelType} {analysis.classType}
                    </h3>
                  </div>
                  <button 
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 rounded-xl hover:bg-error/10 text-outline group-hover:text-error transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-outline uppercase tracking-tighter">Distance</span>
                    <div className="flex items-center gap-1.5 text-on-surface font-bold text-sm">
                      <MapPin className="w-3 h-3 text-primary" />
                      {analysis.distance} mi
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-outline uppercase tracking-tighter">Total Delay</span>
                    <div className="flex items-center gap-1.5 text-on-surface font-bold text-sm">
                      <Clock className="w-3 h-3 text-tertiary" />
                      {analysis.depDelay + analysis.arrDelay}m
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Satisfaction Score</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-sm font-bold text-primary">{analysis.result.satisfactionScore}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.result.satisfactionScore}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    analysis.result.riskLevel === 'Low' ? 'bg-primary/10 text-primary' :
                    analysis.result.riskLevel === 'Medium' ? 'bg-tertiary-container/30 text-primary' :
                    'bg-error/10 text-error'
                  }`}>
                    {analysis.result.riskLevel} Risk
                  </div>
                  <Link 
                    href={`/analyze?id=${analysis.id}`}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
