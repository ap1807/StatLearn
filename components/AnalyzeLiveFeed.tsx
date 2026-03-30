'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, TrendingUp, TrendingDown, Activity, Plane, Users } from 'lucide-react';

interface LiveMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ReactNode;
}

export function AnalyzeLiveFeed() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    {
      label: 'Network Delay Avg',
      value: '14m',
      trend: 'up',
      color: 'text-error',
      icon: <Clock className="w-3.5 h-3.5" />
    },
    {
      label: 'Global Satisfaction',
      value: '84.2%',
      trend: 'down',
      color: 'text-primary',
      icon: <Users className="w-3.5 h-3.5" />
    },
    {
      label: 'Active Flights',
      value: '1,242',
      trend: 'up',
      color: 'text-tertiary',
      icon: <Plane className="w-3.5 h-3.5" />
    }
  ]);

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setTimeout(() => {
        setMetrics(prev => [
          {
            ...prev[0],
            value: `${Math.max(5, parseInt(prev[0].value as string) + (Math.random() > 0.5 ? 1 : -1))}m`,
            trend: Math.random() > 0.5 ? 'up' : 'down'
          },
          {
            ...prev[1],
            value: `${Math.min(100, Math.max(70, parseFloat(prev[1].value as string) + (Math.random() > 0.5 ? 0.1 : -0.1))).toFixed(1)}%`,
            trend: Math.random() > 0.5 ? 'up' : 'down'
          },
          {
            ...prev[2],
            value: (parseInt((prev[2].value as string).replace(',', '')) + (Math.random() > 0.5 ? 5 : -5)).toLocaleString(),
            trend: Math.random() > 0.5 ? 'up' : 'down'
          }
        ]);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsUpdating(false);
      }, 600);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mb-12">
      <div className="glass-panel py-4 px-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Live Feed</span>
            <span className="text-[9px] font-medium text-outline uppercase tracking-tighter leading-none" suppressHydrationWarning>
              Updated: {lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="p-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-on-surface-variant group-hover:text-primary transition-colors">
                {metric.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1.5">
                  {metric.label}
                </span>
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={metric.value}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`text-lg font-bold font-headline leading-none ${metric.color}`}
                    >
                      {metric.value}
                    </motion.span>
                  </AnimatePresence>
                  {metric.trend === 'up' ? (
                    <TrendingUp className={`w-3 h-3 ${metric.color === 'text-error' ? 'text-error' : 'text-primary'}`} />
                  ) : (
                    <TrendingDown className={`w-3 h-3 ${metric.color === 'text-error' ? 'text-primary' : 'text-error'}`} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6 ml-auto pl-6 border-l border-outline-variant/10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">System Health</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-primary/40' : 'bg-outline-variant/20'} animate-pulse`} style={{ animationDelay: `${i * 100}ms` }}></div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
