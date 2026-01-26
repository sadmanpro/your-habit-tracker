'use client';

import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
                <p className='font-semibold text-foreground'>Sadman Prodhan</p>
                <p className='text-sm text-muted-foreground'>Developer of your habit tracker</p>
            </div>
            <div className="flex items-center space-x-4">
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                </Link>
                <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                </Link>
            </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6 pt-6 border-t border-border/20">&copy; {new Date().getFullYear()} All copyright reserved.</p>
      </div>
    </footer>
  );
}
