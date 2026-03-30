import Link from 'next/link';
import { Globe, Settings } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-8 md:py-12 px-6 md:px-8 bg-surface-container-low border-t border-outline-variant/10 mt-auto">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-headline font-bold text-on-surface text-base">StatLearn</span>
          <span className="text-xs text-on-surface-variant opacity-80">© 2026 StatLearn Intelligent Travel. All rights reserved.</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <Link href="#" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium">Privacy Policy</Link>
          <Link href="#" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium">Terms of Service</Link>
          <Link href="#" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium">Support</Link>
          <Link href="#" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium">Documentation</Link>
        </div>

        <div className="flex gap-4">
          <button className="text-on-surface-variant opacity-80 hover:opacity-100 hover:text-primary transition-colors">
            <Globe className="w-5 h-5" />
          </button>
          <button className="text-on-surface-variant opacity-80 hover:opacity-100 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
