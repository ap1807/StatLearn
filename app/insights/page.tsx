'use client';

import { useState, useEffect } from 'react';
import { BarChart, Users, PlaneTakeoff, Clock, ArrowRight, ShieldCheck, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Insights() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveFeed, setLiveFeed] = useState([
    { route: 'JFK → LHR', stat: '-12% NPS', context: 'Weather delays' },
    { route: 'DXB → SYD', stat: '+5% NPS', context: 'New lounge access' },
    { route: 'HND → SFO', stat: 'Stable', context: 'On-time performance' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        const routes = ['LHR → CDG', 'SIN → HKG', 'LAX → NRT', 'FRA → PEK', 'SYD → AKL'];
        const contexts = ['ATC congestion', 'Improved catering', 'Maintenance delay', 'Smooth transit', 'Gate change'];
        const stats = [`${(Math.random() * 20 - 10).toFixed(1)}% NPS`, 'Stable', `+${(Math.random() * 15).toFixed(1)}% NPS`];
        
        const newItem = {
          route: routes[Math.floor(Math.random() * routes.length)],
          stat: stats[Math.floor(Math.random() * stats.length)],
          context: contexts[Math.floor(Math.random() * contexts.length)]
        };

        setLiveFeed(prev => [newItem, ...prev.slice(0, 2)]);
        setLastUpdated(new Date());
        setIsRefreshing(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-grow px-6 lg:px-12 max-w-7xl mx-auto w-full pb-20">
      <div className="mb-12 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">
            AI Synthesis Engine
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Deep dive into the hidden patterns driving passenger satisfaction across global travel networks.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-2xl border border-outline-variant/10">
          <div className="relative">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Live Signals Connected</span>
            <span className="text-xs font-bold text-on-surface">
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['drivers', 'demographics', 'anomalies'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {tab === 'drivers' ? 'Key Drivers' : tab === 'demographics' ? 'Demographic Shifts' : 'Anomaly Detection'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Insight Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-headline text-on-surface">The Delay Threshold Effect</h2>
              <div className="p-2 bg-tertiary-container/20 rounded-xl">
                <BarChart className="text-tertiary w-6 h-6" />
              </div>
            </div>
            
            <p className="text-on-surface-variant leading-relaxed mb-8 text-lg">
              Our models indicate a non-linear relationship between delay duration and satisfaction. The critical drop-off occurs precisely at <span className="font-bold text-error">45 minutes</span> for short-haul flights, after which recovery efforts (like vouchers) lose 80% of their effectiveness.
            </p>

            {/* Visualization Mock */}
            <div className="relative h-64 w-full bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 p-6 flex items-end gap-2">
              {/* Y-axis labels */}
              <div className="absolute left-4 top-4 bottom-8 flex flex-col justify-between text-[10px] text-outline font-bold">
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>
              
              {/* Bars */}
              <div className="flex-grow flex items-end justify-between h-full pl-8 pb-6 relative">
                <div className="absolute bottom-6 left-8 right-0 border-t border-dashed border-error/50 z-0"></div>
                <div className="absolute bottom-6 right-2 text-[10px] text-error font-bold z-10 bg-surface-container-low px-1">Threshold</div>
                
                {[95, 92, 88, 85, 40, 35, 20, 15].map((val, i) => (
                  <div key={i} className="w-full mx-1 relative group z-10 flex flex-col justify-end h-full">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${i >= 4 ? 'bg-error/80' : 'bg-primary/80'}`}
                      style={{ height: `${val}%` }}
                    ></div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-on-surface-variant font-bold">
                      {i * 15}m
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-6 rounded-3xl"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <PlaneTakeoff className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Long-Haul Resilience</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Passengers on flights over 6 hours show a 25% higher tolerance for initial departure delays, provided in-flight amenities meet expectations.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6 rounded-3xl"
            >
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center mb-4">
                <ShieldCheck className="text-tertiary w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Trust Recovery</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Proactive communication within the first 15 minutes of a delay increases the probability of retaining the customer by 3.2x.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="glass-elevated p-6 rounded-3xl bg-gradient-to-b from-surface-container-lowest to-surface-container-low">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-tertiary-container w-5 h-5" />
                <h3 className="font-bold font-headline text-on-surface">Live Data Feed</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <RefreshCcw className={`w-3 h-3 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              </div>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {liveFeed.map((item, i) => (
                    <motion.div 
                      key={`${item.route}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-colors relative overflow-hidden"
                    >
                      {i === 0 && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse"></div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                          {item.route}
                          {i === 0 && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">{item.context}</div>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                        item.stat.includes('+') ? 'bg-primary/10 text-primary' : 
                        item.stat.includes('-') ? 'bg-error/10 text-error' : 
                        'bg-outline-variant/20 text-on-surface-variant'
                      }`}>
                        {item.stat}
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-all flex items-center justify-center gap-2">
              View Full Feed <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold font-headline text-on-surface mb-4">Demographic Variance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">Business Travelers</span>
                  <span className="text-primary">High Sensitivity</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full w-[85%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">Leisure (Families)</span>
                  <span className="text-tertiary">Med Sensitivity</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5">
                  <div className="bg-tertiary h-1.5 rounded-full w-[60%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">Solo Backpackers</span>
                  <span className="text-outline">Low Sensitivity</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5">
                  <div className="bg-outline h-1.5 rounded-full w-[30%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
