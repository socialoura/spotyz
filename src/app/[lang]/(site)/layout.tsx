import { notFound } from 'next/navigation';
import { isValidLanguage, type Language } from '@/i18n/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Script from 'next/script';

interface LayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function SiteLayout({ children, params }: LayoutProps) {
  if (!isValidLanguage(params.lang)) {
    notFound();
  }

  const lang = params.lang as Language;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {googleAdsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-gtag-init"
            strategy="afterInteractive"
          >
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);} 
gtag('js', new Date());
gtag('config', '${googleAdsId}');`}
          </Script>
        </>
      ) : null}
      <Header lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
