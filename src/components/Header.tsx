'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Language, languages } from '@/i18n/config';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';
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
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-24 sm:h-28">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link 
              href={`/${lang}`}
              className="flex items-center transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <Image
                  src="/img/a-modern-flat-vector-logo-design-featuri_ZEbfVp__QiK-0wr5MrgGJg_ZFPYEbSKRM6a11TOK-IQCQ-removebg-preview.png"
                  alt="Socialoura"
                  width={128}
                  height={128}
                  priority
                  sizes="(min-width: 640px) 128px, 96px"
                  className="group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link
              href={`/${lang}/i`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Instagram' : 'Instagram'}
            </Link>
            <Link
              href={`/${lang}/t`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'TikTok' : 'TikTok'}
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Pricing' : 'Tarifs'}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Contact' : 'Contact'}
            </Link>
            <Link
              href={`/${lang}/faq`}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right side - Language & Theme */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <Link
              href={toggleLanguage()}
              className="px-2 py-1 rounded-md transition-all hover:scale-110 flex items-center"
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
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                href={`/${lang}/i`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Instagram' : 'Instagram'}
              </Link>
              <Link
                href={`/${lang}/t`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'TikTok' : 'TikTok'}
              </Link>
              <Link
                href={`/${lang}/pricing`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Pricing' : 'Tarifs'}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {lang === 'en' ? 'Contact' : 'Contact'}
              </Link>
              <Link
                href={`/${lang}/faq`}
                className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              
              {/* Language Switcher */}
              <Link
                href={toggleLanguage()}
                className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors"
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
