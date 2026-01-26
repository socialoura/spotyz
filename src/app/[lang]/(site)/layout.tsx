import { notFound } from 'next/navigation';
import { isValidLanguage, type Language } from '@/i18n/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function SiteLayout({ children, params }: LayoutProps) {
  if (!isValidLanguage(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
