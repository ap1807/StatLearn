'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Bell, X, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNotifications } from './NotificationProvider';
import { useAuth } from './FirebaseProvider';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import Image from 'next/image';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navigation() {
  const pathname = usePathname();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const { user, loading, signIn, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analyze Scenario', href: '/analyze' },
    { name: 'Insights', href: '/insights' },
    { name: 'Compare', href: '/compare' },
    { name: 'Recommendations', href: '/recommendations' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest/70 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/" className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            StatLearn
          </Link>
          <div className="hidden md:flex gap-6 lg:gap-8 items-center h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "font-headline tracking-tight text-sm transition-colors py-1 relative",
                    isActive 
                      ? "text-primary font-semibold" 
                      : "text-on-surface-variant hover:text-primary font-medium"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-tertiary-container rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden lg:flex bg-surface-container-low px-4 py-2 rounded-full items-center gap-2 group focus-within:ring-2 ring-primary/20 transition-all border border-outline-variant/10">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search scenarios..." 
              className="bg-transparent border-none outline-none text-xs text-on-surface w-40 font-medium placeholder:text-outline/70"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-surface-container-low transition-all text-on-surface-variant relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-[60] backdrop-blur-xl"
                >
                  <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
                    <h4 className="font-bold text-sm text-on-surface">Notifications</h4>
                    <button 
                      onClick={clearAll}
                      className="text-[10px] font-bold text-error uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-outline-variant mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-on-surface-variant">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={cn(
                            "p-4 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors cursor-pointer relative",
                            !n.read && "bg-primary/5"
                          )}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className={cn("text-xs font-bold", n.severity === 'high' ? 'text-error' : 'text-on-surface')}>
                              {n.title}
                            </h5>
                            <span className="text-[10px] text-outline">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed">
                            {n.message}
                          </p>
                          {!n.read && (
                            <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 border-l border-outline-variant/20 ml-1 pl-3 md:ml-2 md:pl-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface-container-low animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-low transition-all"
                >
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      width={32} 
                      height={32} 
                      className="rounded-full border border-outline-variant/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-[60] backdrop-blur-xl"
                    >
                      <div className="p-4 border-b border-outline-variant/10">
                        <p className="text-xs font-bold text-on-surface truncate">{user.displayName}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <Link 
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-primary" />
                          My Profile
                        </Link>
                        <button 
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-error hover:bg-error/5 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button 
                  onClick={signIn}
                  className="hidden sm:block text-on-surface-variant hover:text-on-surface px-3 py-1.5 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={signIn}
                  className="sky-gradient text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all scale-100 active:scale-95"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
