'use client';

import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, AlertTriangle, PlaneTakeoff, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const comparisonData = [
  { metric: 'Satisfaction', 'Scenario A': 78, 'Scenario B': 92 },
  { metric: 'On-Time Prob.', 'Scenario A': 60, 'Scenario B': 88 },
  { metric: 'Comfort Score', 'Scenario A': 70, 'Scenario B': 45 },
  { metric: 'Eco-Efficiency', 'Scenario A': 60, 'Scenario B': 95 },
];

export default function Compare() {
  return (
    <main className="flex-grow px-6 lg:px-12 max-w-7xl mx-auto w-full pb-20">
      <div className="mb-12 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">
            Scenario Comparison
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Evaluate multiple travel routes or conditions side-by-side to determine the optimal passenger experience strategy.
          </p>
        </div>
        <button className="sky-gradient text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 whitespace-nowrap self-start md:self-auto">
          <ArrowRightLeft className="w-4 h-4" /> New Comparison
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* VS Badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/20 items-center justify-center z-10 shadow-sm font-bold text-outline-variant">
          VS
        </div>

        {/* Scenario A */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 rounded-3xl border-t-4 border-t-tertiary-container"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-1 block">Scenario A</span>
              <h2 className="text-2xl font-bold font-headline text-on-surface">Nordic Route (Winter)</h2>
            </div>
            <div className="p-2 bg-surface-container-low rounded-lg">
              <PlaneTakeoff className="text-on-surface-variant w-5 h-5" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
              <div className="text-sm text-on-surface-variant mb-1">Predicted Satisfaction</div>
              <div className="text-3xl font-extrabold text-on-surface">78%</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Key Variables</h3>
              
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface font-medium">Weather Delay Risk</span>
                <span className="text-error font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High (40%)</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface font-medium">Cabin Comfort Impact</span>
                <span className="text-primary font-bold">Moderate</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface font-medium">Eco-Efficiency</span>
                <span className="text-on-surface-variant font-bold flex items-center gap-1"><Leaf className="w-3 h-3" /> Standard</span>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">Recommended Action</h3>
              <p className="text-sm text-on-surface leading-relaxed p-4 bg-tertiary-container/10 rounded-xl border border-tertiary-container/20">
                Pre-emptively offer lounge access for delays exceeding 45 minutes. Winter travelers show high appreciation for warm amenities during transit.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scenario B */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 rounded-3xl border-t-4 border-t-primary"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-primary mb-1 block">Scenario B</span>
              <h2 className="text-2xl font-bold font-headline text-on-surface">Tropical Archipelago</h2>
            </div>
            <div className="p-2 bg-surface-container-low rounded-lg">
              <PlaneTakeoff className="text-on-surface-variant w-5 h-5" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
              <div className="text-sm text-on-surface-variant mb-1">Predicted Satisfaction</div>
              <div className="text-3xl font-extrabold text-primary">92%</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Key Variables</h3>
              
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface font-medium">Weather Delay Risk</span>
                <span className="text-tertiary font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Low (12%)</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface font-medium">Cabin Comfort Impact</span>
                <span className="text-error font-bold">High (Heat)</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface font-medium">Eco-Efficiency</span>
                <span className="text-primary font-bold flex items-center gap-1"><Leaf className="w-3 h-3" /> Optimized</span>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">Recommended Action</h3>
              <p className="text-sm text-on-surface leading-relaxed p-4 bg-primary/5 rounded-xl border border-primary/20">
                Focus on rapid boarding and immediate cabin cooling. Delays here cause frustration primarily due to temperature discomfort rather than schedule disruption.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visual Comparison Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 glass-panel p-8 rounded-3xl"
      >
        <h3 className="text-xl font-bold font-headline text-on-surface mb-6">Quantitative Comparison</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255,255,255,0.95)' }}
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Scenario A" name="Nordic Route (A)" fill="#7dd3fc" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="Scenario B" name="Tropical Archipelago (B)" fill="#006591" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </main>
  );
}
