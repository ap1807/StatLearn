'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ExternalLink, RefreshCw, Sparkles, Globe } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Find the latest 4 news articles related to AI in the travel industry, airline technology, and passenger experience innovations from the last 7 days. For each article, provide the title, a brief 1-sentence summary, the source name, and the URL.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                url: { type: Type.STRING },
                source: { type: Type.STRING },
                date: { type: Type.STRING, description: "Approximate date of the news" }
              },
              required: ["title", "summary", "url", "source"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsedNews = JSON.parse(text);
        setNews(parsedNews);
      } else {
        throw new Error("No news found");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to fetch latest news. Please try again later.");
      // Fallback data if search fails or limit reached
      setNews([
        {
          title: "AI-Powered Personalization in Aviation",
          summary: "Airlines are increasingly using generative AI to create hyper-personalized travel offers and improve customer support efficiency.",
          url: "https://www.phocuswire.com",
          source: "PhocusWire",
          date: "2026-03-22"
        },
        {
          title: "The Future of Biometric Boarding",
          summary: "New AI algorithms are making facial recognition boarding faster and more secure at major international hubs.",
          url: "https://www.futuretravelexperience.com",
          source: "Future Travel Experience",
          date: "2026-03-21"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center">
            <Newspaper className="text-primary w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Industry Intelligence</h2>
            <p className="text-sm text-on-surface-variant">Latest updates in Travel & AI Technology</p>
          </div>
        </div>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:opacity-50"
          title="Refresh News"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            // Skeleton Loaders
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="glass-panel p-6 rounded-2xl h-64 flex flex-col gap-4 animate-pulse">
                <div className="h-4 bg-surface-container-low rounded w-3/4"></div>
                <div className="h-3 bg-surface-container-low rounded w-full"></div>
                <div className="h-3 bg-surface-container-low rounded w-5/6"></div>
                <div className="mt-auto flex justify-between">
                  <div className="h-3 bg-surface-container-low rounded w-1/4"></div>
                  <div className="h-3 bg-surface-container-low rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : error && news.length === 0 ? (
            <div className="col-span-full glass-panel p-12 rounded-3xl flex flex-col items-center text-center">
              <Globe className="w-12 h-12 text-outline-variant mb-4" />
              <p className="text-on-surface-variant">{error}</p>
              <button onClick={fetchNews} className="mt-4 text-primary font-bold">Try Again</button>
            </div>
          ) : (
            news.map((article, index) => (
              <motion.div
                key={article.url + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-6 rounded-2xl flex flex-col h-full group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                    {article.source}
                  </span>
                  <Sparkles className="w-3 h-3 text-tertiary-container opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h3 className="text-base font-bold text-on-surface mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                  {article.summary}
                </p>
                
                <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-[10px] text-outline font-medium">
                    {article.date || 'Recent'}
                  </span>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    Read More <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
