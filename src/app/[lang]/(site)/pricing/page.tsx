'use client';

import { Language } from '@/i18n/config';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { lang: string };
}

export default function PricingPage({ params }: PageProps) {
  const lang = params.lang as Language;

  const content = {
    en: {
      title: 'Test our subscription with our trial offer',
      subtitle: 'Start growing your social media presence today',
      plan: {
        name: 'PREMIUM',
        price: '$39.90',
        period: 'per month',
        features: [
          '24h trial to explore all features',
          'Audience research and targeting',
          'Content placement recommendations',
          'Manual, human-driven promotion',
          'Strategic recommendations to improve reach',
        ],
        cta: 'SUBSCRIBE NOW',
      },
    },
    fr: {
      title: 'Testez notre abonnement avec notre offre d\'essai',
      subtitle: 'Commencez à développer votre présence sur les réseaux sociaux dès aujourd\'hui',
      plan: {
        name: 'PREMIUM',
        price: '39,90€',
        period: 'par mois',
        features: [
          'Essai de 24h pour explorer toutes les fonctionnalités',
          'Recherche et ciblage d\'audience',
          'Conseils pour le placement de contenu',
          'Promotion manuelle dirigée par des humains',
          'Recommandations stratégiques pour améliorer la portée',
        ],
        cta: 'S\'ABONNER MAINTENANT',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
              <div className="rounded-3xl p-8 ring-2 ring-indigo-600 dark:ring-indigo-500 bg-white dark:bg-gray-800 shadow-2xl">
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                  {t.plan.name}
                </h3>
                
                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {t.plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {t.plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {t.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${lang}`}
                  className="block w-full text-center rounded-lg bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                >
                  {t.plan.cta}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
