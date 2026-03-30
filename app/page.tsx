import Link from 'next/link';
import { Search, TrendingUp, Database, Activity, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { NewsSection } from '@/components/NewsSection';
import { LiveMetrics } from '@/components/LiveMetrics';

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary-container/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest border border-tertiary-container/30 text-primary text-xs font-bold tracking-wider uppercase mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI Decision Copilot 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-6 leading-[1.1] font-headline">
            Smart Travel <br />
            <span className="text-primary">Decision Copilot</span>
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant font-normal max-w-2xl mx-auto mb-12 leading-relaxed">
            Don&apos;t just analyze data—make better decisions. Our AI copilot predicts friction points and simulates the impact of your next best action.
          </p>

          {/* Smart Search UI */}
          <div className="glass-elevated p-2 rounded-2xl w-full max-w-2xl mx-auto flex items-center transition-all focus-within:ring-4 ring-primary/10">
            <div className="flex-grow flex items-center px-4">
              <Sparkles className="text-tertiary-container w-6 h-6 mr-3" />
              <input 
                type="text" 
                placeholder="How do delays affect passenger experience?" 
                className="bg-transparent border-none text-on-surface placeholder:text-outline/60 focus:ring-0 w-full py-3 text-lg outline-none font-medium"
              />
            </div>
            <Link href="/analyze" className="sky-gradient text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2">
              Analyze
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid Insights Preview */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10">
        {/* Large Card */}
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp className="text-primary w-12 h-12 opacity-10 group-hover:opacity-30 transition-opacity duration-500" />
          </div>
          <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">Global Satisfaction Trends</h3>
          <p className="text-on-surface-variant mb-10 max-w-md text-sm leading-relaxed">
            Real-time analysis of traveler feedback across 120+ airlines based on transit duration.
          </p>
          
          {/* Abstract Bar Chart */}
          <div className="w-full h-56 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 flex items-end justify-between p-6 gap-3 md:gap-4">
            <div className="bg-primary-container/60 w-full h-[35%] rounded-t-xl transition-all duration-500 group-hover:h-[40%]"></div>
            <div className="bg-primary-container w-full h-[60%] rounded-t-xl transition-all duration-500 group-hover:h-[65%]"></div>
            <div className="bg-tertiary-container/80 w-full h-[50%] rounded-t-xl transition-all duration-500 group-hover:h-[55%]"></div>
            <div className="bg-primary w-full h-[85%] rounded-t-xl shadow-lg shadow-primary/20 relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1 rounded-lg text-xs font-bold text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Peak</div>
            </div>
            <div className="bg-tertiary-container w-full h-[70%] rounded-t-xl transition-all duration-500 group-hover:h-[75%]"></div>
            <div className="bg-primary-container/80 w-full h-[40%] rounded-t-xl transition-all duration-500 group-hover:h-[45%]"></div>
          </div>
        </div>

        {/* Small Card 1 */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Database className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-3">Data Sources</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Access over 5M anonymized travel records from major global hubs updated every 6 hours.
            </p>
          </div>
          <Link href="/insights" className="text-primary text-sm font-bold flex items-center mt-8 group-hover:gap-2 transition-all">
            Explore API <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Small Card 2 */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container/20 flex items-center justify-center mb-6">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-3">Impact Simulator</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Simulate delay impacts and test mitigation strategies before implementation to ensure maximum satisfaction recovery.
            </p>
          </div>
          <Link href="/analyze" className="text-primary text-sm font-bold flex items-center mt-8 group-hover:gap-2 transition-all">
            Simulate Impact <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Wide Card Bottom */}
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 overflow-hidden group">
          <div className="flex-shrink-0 w-full md:w-48 h-32 rounded-2xl bg-gradient-to-br from-surface-container-lowest to-surface-container-low flex items-center justify-center border border-outline-variant/20 relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
             <TrendingUp className="w-12 h-12 text-primary/60 relative z-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-3">Predictive Class Impact</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Our latest study shows that seat comfort and cleanliness are 40% more critical to Business Class passengers than WiFi speed during delays over 2 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Live Metrics Section */}
      <LiveMetrics />

      {/* Industry News Section */}
      <NewsSection />
    </main>
  );
}
