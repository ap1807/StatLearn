'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Activity, AlertTriangle, Frown, Lightbulb, ShieldCheck, TrendingDown, TrendingUp, Zap, X, ShieldAlert, Sparkles } from 'lucide-react';
import { StatisticalEngine, type AnalysisResult } from '@/lib/engine';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '@/components/NotificationProvider';
import { useAuth } from '@/components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { AnalyzeLiveFeed } from '@/components/AnalyzeLiveFeed';
import { Bookmark, CheckCircle2, Save } from 'lucide-react';

export default function AnalyzeScenario() {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [distance, setDistance] = useState<number>(1200);
  const [classType, setClassType] = useState<string>('Economy');
  const [depDelay, setDepDelay] = useState<number>(0);
  const [arrDelay, setArrDelay] = useState<number>(0);
  const [travelType, setTravelType] = useState<string>('Personal');
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<{ newProb: number; improvement: number } | null>(null);
  const [errors, setErrors] = useState<{distance?: string, depDelay?: string, arrDelay?: string}>({});
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const validateDistance = (val: number) => {
    if (val <= 0) return "Distance must be greater than 0.";
    if (val > 20000) return "Distance exceeds realistic limits (20,000 miles).";
    return undefined;
  };

  const validateDelay = (val: number, type: string) => {
    if (val < 0) return `${type} delay cannot be negative.`;
    if (val > 4320) return `${type} delay exceeds 72 hours.`;
    return undefined;
  };

  const handleDistanceChange = (val: number) => {
    setDistance(val);
    setErrors(prev => ({ ...prev, distance: validateDistance(val) }));
  };

  const handleDepDelayChange = (val: number) => {
    setDepDelay(val);
    setErrors(prev => ({ ...prev, depDelay: validateDelay(val, 'Departure') }));
  };

  const handleArrDelayChange = (val: number) => {
    setArrDelay(val);
    setErrors(prev => ({ ...prev, arrDelay: validateDelay(val, 'Arrival') }));
  };

  const fetchAiInsight = async (res: AnalysisResult) => {
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: `As an AI Travel Experience Strategist, provide a single, punchy, and highly actionable strategic recommendation for a flight with the following risk profile:
        - Dissatisfaction Risk: ${res.probabilityOfDissatisfaction}%
        - Primary Factor: ${res.primaryFactor}
        - Travel Type: ${travelType}
        - Class: ${classType}
        - Total Delay: ${depDelay + arrDelay} minutes
        
        Focus on immediate passenger recovery and brand loyalty preservation. Keep it under 30 words.`,
      });
      setAiInsight(response.text || "Prioritize immediate communication and personalized recovery vouchers to mitigate long-term brand damage.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setAiInsight("Prioritize immediate communication and personalized recovery vouchers to mitigate long-term brand damage.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAnalyze = () => {
    const distErr = validateDistance(distance);
    const depErr = validateDelay(depDelay, 'Departure');
    const arrErr = validateDelay(arrDelay, 'Arrival');
    
    if (distErr || depErr || arrErr) {
      setErrors({ distance: distErr, depDelay: depErr, arrDelay: arrErr });
      return;
    }

    setIsAnalyzing(true);
    setSimulatedResult(null);
    setAiInsight(null);
    setSaveSuccess(false);
    // Simulate network delay for realism
    setTimeout(async () => {
      const res = StatisticalEngine.analyzeScenario({
        distance,
        classType,
        depDelay,
        arrDelay,
        travelType
      });
      setResult(res);
      setIsAnalyzing(false);

      // Trigger notification if high risk
      if (res.isHighRisk) {
        addNotification({
          title: 'High-Risk Scenario Detected',
          message: `A ${res.probabilityOfDissatisfaction}% dissatisfaction risk was predicted for a ${distance}mi ${classType} flight.`,
          severity: 'high'
        });
        setShowHighRiskModal(true);
      }

      // Fetch AI Insight
      fetchAiInsight(res);
    }, 800);
  };

  const handleSimulate = () => {
    if (!result) return;
    setIsSimulating(true);
    setTimeout(() => {
      const sim = StatisticalEngine.simulateImpact(result);
      setSimulatedResult(sim);
      setIsSimulating(false);
    }, 600);
  };

  const handleSaveAnalysis = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    const path = 'analyses';
    try {
      await addDoc(collection(db, path), {
        uid: user.uid,
        distance,
        classType,
        depDelay,
        arrDelay,
        travelType,
        result,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      addNotification({
        title: 'Analysis Saved',
        message: 'Your analysis has been saved to your dashboard.',
        severity: 'low'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-grow px-6 lg:px-12 max-w-7xl mx-auto w-full pb-20">
      {/* Header Section */}
      <div className="mb-12 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">
            Analyze Your Travel Scenario
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Input your flight details to predict passenger satisfaction and identify potential friction points in the journey.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-2xl border border-outline-variant/10">
          <div className="relative">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Live Predictive Engine</span>
            <span className="text-xs font-bold text-on-surface">
              System Ready
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Data Feed */}
      <AnalyzeLiveFeed />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Input Form Section */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="glass-panel p-8 rounded-3xl">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Flight Distance (miles)</label>
                  <input 
                    type="number" 
                    value={distance}
                    onChange={(e) => handleDistanceChange(Number(e.target.value))}
                    className={`w-full bg-surface-container-low border ${errors.distance ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant/30 focus:ring-primary/20 focus:border-primary'} rounded-xl px-4 py-3.5 focus:ring-2 transition-all outline-none text-on-surface placeholder:text-outline`}
                    placeholder="e.g. 1200" 
                  />
                  {errors.distance && <p className="text-error text-xs font-medium mt-1">{errors.distance}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Travel Class</label>
                  <div className="relative">
                    <select 
                      value={classType}
                      onChange={(e) => setClassType(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface appearance-none"
                    >
                      <option>Economy</option>
                      <option>Business</option>
                      <option>First Class</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface">Departure Delay (min)</label>
                    <input 
                      type="number" 
                      value={depDelay}
                      onChange={(e) => handleDepDelayChange(Number(e.target.value))}
                      className={`w-full bg-surface-container-low border ${errors.depDelay ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant/30 focus:ring-primary/20 focus:border-primary'} rounded-xl px-4 py-3.5 focus:ring-2 transition-all outline-none text-on-surface`}
                    />
                    {errors.depDelay && <p className="text-error text-xs font-medium mt-1">{errors.depDelay}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface">Arrival Delay (min)</label>
                    <input 
                      type="number" 
                      value={arrDelay}
                      onChange={(e) => handleArrDelayChange(Number(e.target.value))}
                      className={`w-full bg-surface-container-low border ${errors.arrDelay ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant/30 focus:ring-primary/20 focus:border-primary'} rounded-xl px-4 py-3.5 focus:ring-2 transition-all outline-none text-on-surface`}
                    />
                    {errors.arrDelay && <p className="text-error text-xs font-medium mt-1">{errors.arrDelay}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-on-surface">Travel Type</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="travel_type" 
                        value="Business"
                        checked={travelType === 'Business'}
                        onChange={(e) => setTravelType(e.target.value)}
                        className="hidden peer" 
                      />
                      <div className="p-4 border border-outline-variant/30 rounded-xl text-center bg-surface-container-lowest text-on-surface-variant font-medium peer-checked:bg-primary/5 peer-checked:border-primary peer-checked:text-primary transition-all">
                        Business
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="travel_type" 
                        value="Personal"
                        checked={travelType === 'Personal'}
                        onChange={(e) => setTravelType(e.target.value)}
                        className="hidden peer" 
                      />
                      <div className="p-4 border border-outline-variant/30 rounded-xl text-center bg-surface-container-lowest text-on-surface-variant font-medium peer-checked:bg-primary/5 peer-checked:border-primary peer-checked:text-primary transition-all">
                        Personal
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isAnalyzing || !!errors.distance || !!errors.depDelay || !!errors.arrDelay}
                className="w-full sky-gradient text-white py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Analyze Experience
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-elevated p-8 md:p-10 rounded-3xl relative overflow-hidden flex flex-col h-full justify-center border-l-4 ${result.isHighRisk ? 'border-l-error ring-4 ring-error/20 animate-pulse-border' : 'border-l-primary'}`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <AlertTriangle className="w-32 h-32" />
                </div>
                
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${result.isHighRisk ? 'bg-error/10' : 'bg-primary/10'}`}>
                      <Frown className={result.isHighRisk ? 'text-error' : 'text-primary'} />
                    </div>
                    <span className={`font-bold tracking-widest uppercase text-xs ${result.isHighRisk ? 'text-error' : 'text-primary'}`}>
                      Prediction Alert
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Confidence</span>
                    <span className="text-sm font-bold text-primary">{result.confidenceScore}%</span>
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4 leading-tight font-headline">
                  {result.isHighRisk ? 'High chance of dissatisfaction due to journey friction' : 'Moderate satisfaction expected with some friction points'}
                </h2>

                <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 mb-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">What is happening</span>
                    <p className="text-sm text-on-surface leading-relaxed">{result.reasoning.what}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Why it is happening</span>
                    <p className="text-sm text-on-surface leading-relaxed">{result.reasoning.why}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-grow h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.probabilityOfDissatisfaction}%` }}
                      className={`h-full ${result.isHighRisk ? 'bg-error' : 'bg-primary'}`}
                    />
                  </div>
                  <span className={`font-bold text-lg whitespace-nowrap ${result.isHighRisk ? 'text-error' : 'text-primary'}`}>
                    {result.probabilityOfDissatisfaction}% Dissatisfaction Risk
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-widest">Contributing Factors</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.contributingFactors.map((factor, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/5">
                        <span className="text-xs font-medium text-on-surface">{factor.factor}</span>
                        <div className="flex items-center gap-1">
                          {factor.type === 'negative' ? <TrendingUp className="w-3 h-3 text-error" /> : <TrendingDown className="w-3 h-3 text-primary" />}
                          <span className={`text-[10px] font-bold ${factor.type === 'negative' ? 'text-error' : 'text-primary'}`}>
                            {factor.type === 'negative' ? '+' : '-'}{factor.impact}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-outline-variant/10 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-widest">Primary Factor</span>
                      <span className="text-on-surface font-semibold text-lg">{result.primaryFactor}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-widest">Recommended Mitigation</span>
                      <span className="text-primary font-semibold text-lg">{result.mitigation}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-[10px] text-primary font-bold block uppercase tracking-widest mb-2">Copilot Next Best Action</span>
                    <p className="text-on-surface font-medium text-sm leading-relaxed">
                      {result.nextBestAction}
                    </p>
                  </div>

                  {/* AI Strategic Insight */}
                  <AnimatePresence>
                    {(isAiThinking || aiInsight) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-tertiary" />
                          <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest">Strategic AI Insight</span>
                          {isAiThinking && <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse ml-auto"></div>}
                        </div>
                        {isAiThinking ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-tertiary/10 rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-tertiary/10 rounded w-1/2 animate-pulse"></div>
                          </div>
                        ) : (
                          <p className="text-on-surface font-medium text-sm leading-relaxed italic">
                            &quot;{aiInsight}&quot;
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleSimulate}
                      disabled={isSimulating || !!simulatedResult}
                      className="w-full bg-surface-container-lowest border border-primary/30 text-primary py-3 rounded-xl font-bold text-sm transition-all hover:bg-primary/5 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSimulating ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Simulate Mitigation Impact
                        </>
                      )}
                    </button>

                    {user && (
                      <button 
                        onClick={handleSaveAnalysis}
                        disabled={isSaving || saveSuccess}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          saveSuccess 
                            ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' 
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98]'
                        }`}
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : saveSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Saved to Dashboard
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Analysis to Dashboard
                          </>
                        )}
                      </button>
                    )}
                    
                    <AnimatePresence>
                      {simulatedResult && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-tertiary-container/10 rounded-2xl border border-tertiary-container/20 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="text-tertiary w-5 h-5" />
                            <div>
                              <div className="text-xs font-bold text-on-surface">Expected Outcome</div>
                              <div className="text-[10px] text-on-surface-variant">Risk reduced to {simulatedResult.newProb}%</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-tertiary">
                            -{simulatedResult.improvement}%
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center h-full text-center border-dashed border-2 border-outline-variant/30"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-outline-variant" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">Awaiting Parameters</h3>
                <p className="text-on-surface-variant max-w-sm">Adjust the scenario parameters on the left and run the analysis to see predictive insights.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secondary Insight */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 rounded-2xl flex items-start md:items-center gap-4"
              >
                <div className="bg-tertiary/10 p-2 rounded-xl shrink-0">
                  <Lightbulb className="text-tertiary w-6 h-6" />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  <span className="font-semibold text-on-surface">Pro-tip:</span> {result.proTip}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* High Risk Modal */}
      <AnimatePresence>
        {showHighRiskModal && result && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHighRiskModal(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-error/20 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-error animate-pulse"></div>
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-error/10 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-error" />
                  </div>
                  <button 
                    onClick={() => setShowHighRiskModal(false)}
                    className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
                  >
                    <X className="w-6 h-6 text-on-surface-variant" />
                  </button>
                </div>

                <h2 className="text-3xl font-extrabold text-on-surface mb-4 font-headline leading-tight">
                  Immediate Action Required
                </h2>
                <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                  A critical dissatisfaction risk of <span className="text-error font-bold">{result.probabilityOfDissatisfaction}%</span> has been detected for this flight. High-value passengers are at risk of churn.
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                    <div className="w-2 h-2 rounded-full bg-error mt-2 animate-pulse"></div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">Priority Recovery</div>
                      <div className="text-xs text-on-surface-variant">Trigger proactive rebooking and lounge access workflow.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                    <div className="w-2 h-2 rounded-full bg-error mt-2 animate-pulse"></div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">Agent Empowerment</div>
                      <div className="text-xs text-on-surface-variant">Authorize discretionary compensation for gate agents.</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setShowHighRiskModal(false)}
                    className="w-full bg-error text-white py-4 rounded-2xl font-bold shadow-lg shadow-error/20 hover:bg-error/90 transition-all active:scale-[0.98]"
                  >
                    Deploy Recovery Plan
                  </button>
                  <button 
                    onClick={() => setShowHighRiskModal(false)}
                    className="w-full bg-surface-container-low text-on-surface py-4 rounded-2xl font-bold hover:bg-surface-container transition-all"
                  >
                    Dismiss Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visual Decoration */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="h-32 w-full relative rounded-2xl overflow-hidden border border-outline-variant/20">
          <Image src="https://picsum.photos/seed/plane/800/400" alt="Airplane wing" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="h-32 w-full relative rounded-2xl overflow-hidden border border-outline-variant/20">
          <Image src="https://picsum.photos/seed/airport/800/400?blur=2" alt="Airport terminal" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="h-32 w-full relative rounded-2xl overflow-hidden border border-outline-variant/20">
          <Image src="https://picsum.photos/seed/data/800/400" alt="Data dashboard" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
    </main>
  );
}
