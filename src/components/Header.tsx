'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Language, languages } from '@/i18n/config';
import ThemeToggle from './ThemeToggle';
import { Menu, X, Music } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import Image from 'next/image';

interface HeaderProps {
  lang: Language;
}

export default function Header({ lang }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get the current path without the language prefix
  const getPathWithoutLang = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && languages.includes(segments[0] as Language)) {
      return '/' + segments.slice(1).join('/');
    }
    return '/';
  };

  // Get the path for a different language
  const getPathForLanguage = (targetLang: Language) => {
    const pathWithoutLang = getPathWithoutLang();
    return `/${targetLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  };

  // Toggle to the other language
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'fr' : 'en';
    return getPathForLanguage(newLang);
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white/85 backdrop-blur-md sticky top-0 z-50 dark:border-gray-800 dark:bg-gray-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 sm:h-[72px]">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link 
              href={`/${lang}`}
              className="flex items-center transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative w-44 h-12 sm:w-52 sm:h-14 shrink-0 overflow-visible">
                <Image
                  src="/img/a-modern-flat-vector-logo-design-featuri_ZEbfVp__QiK-0wr5MrgGJg_ZFPYEbSKRM6a11TOK-IQCQ-removebg-preview.png"
                  alt="Spotyz"
                  fill
                  priority
                  sizes="(min-width: 640px) 256px, 208px"
                  className="object-contain transition-transform scale-[3] group-hover:scale-[3.2]"
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 text-base font-semibold text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#1DB954] text-white">
                <Music className="w-3.5 h-3.5" />
              </span>
              {lang === 'en' ? 'Homepage' : 'Accueil'}
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className="text-base font-semibold text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
            >
              {lang === 'en' ? 'Pricing' : 'Tarifs'}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="text-base font-semibold text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
            >
              {lang === 'en' ? 'Contact' : 'Contact'}
            </Link>
            <Link
              href={`/${lang}/faq`}
              className="text-base font-semibold text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
            >
              FAQ
            </Link>
          </nav>

          {/* Right side - Language & Theme */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <Link
              href={toggleLanguage()}
              className="px-2 py-1 rounded-md transition-all hover:scale-110 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label={lang === 'en' ? 'Passer au français' : 'Switch to English'}
              title={lang === 'en' ? 'Français' : 'English'}
            >
              <ReactCountryFlag
                countryCode={lang === 'en' ? 'FR' : 'GB'}
                svg
                style={{
                  width: '1.5em',
                  height: '1.5em',
                }}
                title={lang === 'en' ? 'Français' : 'English'}
              />
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col space-y-4">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center gap-2 text-base font-medium text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#1DB954] text-white">
                  <Music className="w-3.5 h-3.5" />
                </span>
                {lang === 'en' ? 'Homepage' : 'Accueil'}
              </Link>
              <Link
                href={`/${lang}/pricing`}
                className="text-base font-medium text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Pricing' : 'Tarifs'}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="text-base font-medium text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Contact' : 'Contact'}
              </Link>
              <Link
                href={`/${lang}/faq`}
                className="text-base font-medium text-gray-700 hover:text-emerald-500 transition-colors dark:text-gray-200 dark:hover:text-emerald-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              
              {/* Language Switcher */}
              <Link
                href={toggleLanguage()}
                className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-emerald-500 pt-4 border-t border-gray-200 transition-colors dark:text-gray-200 dark:hover:text-emerald-400 dark:border-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ReactCountryFlag
                  countryCode={lang === 'en' ? 'FR' : 'GB'}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                  }}
                  title={lang === 'en' ? 'Français' : 'English'}
                />
                <span>{lang === 'en' ? 'Français' : 'English'}</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
