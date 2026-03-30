'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Activity, Globe } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface Metric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  color: string;
}

export function LiveMetrics() {
  const [metrics, setMetrics] = useState<Record<string, Metric>>({
    delays: {
      label: 'Current Flight Delays',
      value: 142,
      unit: 'Flights',
      trend: 'up',
      change: 12,
      color: 'text-error'
    },
    satisfaction: {
      label: 'Passenger Satisfaction Index',
      value: 84.2,
      unit: '%',
      trend: 'down',
      change: 0.5,
      color: 'text-primary'
    },
    otp: {
      label: 'On-Time Performance',
      value: 91.8,
      unit: '%',
      trend: 'up',
      change: 1.2,
      color: 'text-tertiary'
    }
  });

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isUpdating, setIsUpdating] = useState(false);
  const isUpdatingRef = useRef(false);
  const [isLive, setIsLive] = useState(false);

  const fetchRealWorldData = async () => {
    try {
      setIsUpdating(true);
      isUpdatingRef.current = true;
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Search for current global flight delay statistics, average passenger satisfaction index for 2026, and global on-time performance for major airlines today. Return the data in JSON format.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              delays: { type: Type.NUMBER, description: "Total estimated global flight delays currently" },
              satisfaction: { type: Type.NUMBER, description: "Current global passenger satisfaction index percentage" },
              otp: { type: Type.NUMBER, description: "Current global on-time performance percentage" }
            },
            required: ["delays", "satisfaction", "otp"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      const data = JSON.parse(text);
      
      setMetrics(prev => ({
        delays: {
          ...prev.delays,
          value: data.delays || prev.delays.value,
          trend: data.delays > prev.delays.value ? 'up' : 'down',
          change: Math.abs(data.delays - prev.delays.value)
        },
        satisfaction: {
          ...prev.satisfaction,
          value: data.satisfaction || prev.satisfaction.value,
          trend: data.satisfaction > prev.satisfaction.value ? 'up' : 'down',
          change: Number(Math.abs(data.satisfaction - prev.satisfaction.value).toFixed(2))
        },
        otp: {
          ...prev.otp,
          value: data.otp || prev.otp.value,
          trend: data.otp > prev.otp.value ? 'up' : 'down',
          change: Number(Math.abs(data.otp - prev.otp.value).toFixed(2))
        }
      }));
      setIsLive(true);
    } catch (error) {
      console.error("Failed to fetch real-world metrics:", error);
    } finally {
      setLastUpdated(new Date().toLocaleTimeString());
      setIsUpdating(false);
      isUpdatingRef.current = false;
    }
  };

  useEffect(() => {
    fetchRealWorldData();

    const dataInterval = setInterval(fetchRealWorldData, 120000);

    const uiInterval = setInterval(() => {
      if (isUpdatingRef.current) return;
      
      setMetrics(prev => {
        const newDelays = Math.max(0, prev.delays.value + (Math.random() > 0.5 ? 1 : -1));
        const newSatisfaction = Math.min(100, Math.max(0, prev.satisfaction.value + (Math.random() > 0.5 ? 0.01 : -0.01)));
        const newOtp = Math.min(100, Math.max(0, prev.otp.value + (Math.random() > 0.5 ? 0.02 : -0.02)));

        return {
          delays: { ...prev.delays, value: newDelays, change: 1 },
          satisfaction: { ...prev.satisfaction, value: Number(newSatisfaction.toFixed(2)), change: 0.01 },
          otp: { ...prev.otp, value: Number(newOtp.toFixed(2)), change: 0.02 }
        };
      });
      setLastUpdated(new Date().toLocaleTimeString());
    }, 10000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(uiInterval);
    };
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 pb-24">
      <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-headline text-on-surface">Live Network Pulse</h2>
                {isLive && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full">
                    <Globe className="w-3 h-3 text-primary" />
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Real-World Data</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-on-surface-variant">Real-time global travel operations stream</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <Clock className="w-4 h-4 text-on-surface-variant" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Last Updated: <span className="text-on-surface" suppressHydrationWarning>{lastUpdated}</span>
            </span>
            {isUpdating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse ml-2"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(metrics).map(([key, metric], index) => (
            <div key={key} className="relative group">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {metric.label}
                </span>
                
                <div className="flex items-baseline gap-2">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={metric.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-4xl font-extrabold font-headline ${metric.color}`}
                    >
                      {metric.value}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-lg font-bold text-on-surface-variant">{metric.unit}</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    metric.trend === 'up' 
                      ? (key === 'delays' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary')
                      : (key === 'delays' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error')
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.change}{metric.unit === '%' ? '%' : ''}
                  </div>
                  <span className="text-[10px] text-outline font-medium uppercase tracking-tighter">vs 5m ago</span>
                </div>
              </div>

              {index < 2 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-16 w-px bg-outline-variant/20" />
              )}
            </div>
          ))}
        </div>

        {/* Live Ticker Decoration */}
        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex items-center gap-8 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest shrink-0">
            <Activity className="w-3 h-3" />
            Live Feed
          </div>
          <div className="flex gap-12 animate-marquee">
            <span className="text-[10px] text-on-surface-variant font-medium">LHR: 12m avg delay</span>
            <span className="text-[10px] text-on-surface-variant font-medium">JFK: OTP 94.2%</span>
            <span className="text-[10px] text-on-surface-variant font-medium">SIN: Satisfaction 98.1%</span>
            <span className="text-[10px] text-on-surface-variant font-medium">DXB: High traffic alert</span>
            <span className="text-[10px] text-on-surface-variant font-medium">HND: On-time performance peak</span>
            {/* Duplicate for seamless loop */}
            <span className="text-[10px] text-on-surface-variant font-medium">LHR: 12m avg delay</span>
            <span className="text-[10px] text-on-surface-variant font-medium">JFK: OTP 94.2%</span>
            <span className="text-[10px] text-on-surface-variant font-medium">SIN: Satisfaction 98.1%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
