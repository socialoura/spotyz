import { notFound } from 'next/navigation';
import { isValidLanguage } from '@/i18n/config';

interface LayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function LanguageLayout({ children, params }: LayoutProps) {
  if (!isValidLanguage(params.lang)) {
    notFound();
  }

  return <>{children}</>;
}
