'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import Link from 'next/link';
import { Plus, Minus, BarChart3, Calendar, MessageCircle, HeadphonesIcon } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import ReviewsSection from '@/components/ReviewsSection';
import TrustedBrands from '@/components/TrustedBrands';

interface PageProps {
  params: { lang: string };
}

export default function HomePage({ params }: PageProps) {
  const lang = params.lang as Language;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };
  
  const content = {
    en: {
      hero: {
        headline: 'Boost Your YouTube Views',
        subheadline: 'Choose a pack, enter your YouTube video link, and get fast delivery with secure payment.',
        cta: 'Buy YouTube views',
      },
      services: {
        title: 'Our Services',
        subtitle: 'Everything you need to succeed on social media',
        items: [
          {
            title: 'YouTube Views Packs',
            description: 'Select a views pack tailored to your goals and get a structured delivery process.',
            icon: BarChart3,
          },
          {
            title: 'Fast Delivery',
            description: 'Orders start quickly after payment and are delivered progressively for a natural-looking result.',
            icon: Calendar,
          },
          {
            title: 'Secure Payments',
            description: 'Checkout securely with Stripe. No password is needed, only your video link.',
            icon: MessageCircle,
          },
          {
            title: '24/7 Support',
            description: 'Our dedicated support team is always ready to help you maximize your results.',
            icon: HeadphonesIcon,
          },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about our services',
        items: [
          {
            question: 'Is your service safe for my account?',
            answer: 'Yes, our marketing strategies are designed to comply with platform guidelines and best practices to keep your account secure.',
          },
          {
            question: 'How quickly will I see results?',
            answer: 'Most clients see noticeable improvements within the first 2-4 weeks, with consistent progress over time.',
          },
          {
            question: 'Can I cancel my subscription anytime?',
            answer: 'Absolutely! You can cancel your subscription at any time with no questions asked. No hidden fees or commitments.',
          },
          {
            question: 'Do you offer a free trial?',
            answer: 'Yes, we offer a 7-day free trial on all our plans so you can test our services risk-free.',
          },
          {
            question: 'What makes you different from competitors?',
            answer: 'We focus on authentic audience development with strategic targeting, provide superior customer support, and offer transparent pricing with no hidden costs.',
          },
          {
            question: 'Which platforms do you support?',
            answer: 'We currently support YouTube video views packs.',
          },
        ],
      },
    },
    fr: {
      hero: {
        headline: 'Augmente tes vues YouTube',
        subheadline: 'Choisis un pack, colle le lien de ta vidéo YouTube, et profite d\'une livraison rapide avec paiement sécurisé.',
        cta: 'Acheter des vues',
      },
      services: {
        title: 'Nos Services',
        subtitle: 'Tout ce dont vous avez besoin pour réussir sur les réseaux sociaux',
        items: [
          {
            title: 'Packs de vues YouTube',
            description: 'Choisissez un pack adapté à vos objectifs et profitez d\'une livraison structurée.',
            icon: BarChart3,
          },
          {
            title: 'Livraison rapide',
            description: 'Les commandes démarrent rapidement après paiement et sont livrées progressivement.',
            icon: Calendar,
          },
          {
            title: 'Paiement sécurisé',
            description: 'Paiement sécurisé via Stripe. Aucun mot de passe requis, seulement le lien de la vidéo.',
            icon: MessageCircle,
          },
          {
            title: 'Support 24/7',
            description: 'Notre équipe d\'assistance est disponible pour t\'aider à maximiser tes résultats.',
            icon: HeadphonesIcon,
          },
        ],
      },
      faq: {
        title: 'Questions Fréquemment Posées',
        subtitle: 'Tout ce que vous devez savoir sur nos services',
        items: [
          {
            question: 'Votre service est-il sûr pour mon compte ?',
            answer: 'Oui, nos stratégies marketing sont conçues pour respecter les directives des plateformes et les meilleures pratiques pour garder votre compte sécurisé.',
          },
          {
            question: 'À quelle vitesse verrai-je des résultats ?',
            answer: 'La plupart des clients constatent des améliorations notables dans les 2 à 4 premières semaines, avec des progrès constants au fil du temps.',
          },
          {
            question: 'Puis-je annuler mon abonnement à tout moment ?',
            answer: 'Absolument ! Vous pouvez annuler votre abonnement à tout moment sans poser de questions. Aucun frais caché ni engagement.',
          },
          {
            question: 'Offrez-vous un essai gratuit ?',
            answer: 'Oui, nous offrons un essai gratuit de 7 jours sur tous nos forfaits afin que vous puissiez tester nos services sans risque.',
          },
          {
            question: 'Qu\'est-ce qui vous différencie de la concurrence ?',
            answer: 'Nous nous concentrons sur le développement d\'audience authentique avec un ciblage stratégique, offrons un support client supérieur et proposons des prix transparents sans frais cachés.',
          },
          {
            question: 'Quelles plateformes supportez-vous ?',
            answer: 'Nous proposons actuellement des packs de vues pour les vidéos YouTube.',
          },
        ],
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:flex lg:items-center lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl mb-6 leading-tight">
              {t.hero.headline}
            </h1>
            <p className="text-lg leading-relaxed text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10">
              {t.hero.subheadline}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href={`/${lang}/packs`}
                className="group relative overflow-hidden rounded-xl bg-red-600 hover:bg-red-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M10 8.5V15.5L16 12L10 8.5Z" />
                    <path d="M21 12c0-2.5-.2-4.2-.5-5.3a2.5 2.5 0 0 0-1.8-1.8C17.6 4.6 12 4.6 12 4.6s-5.6 0-6.7.3A2.5 2.5 0 0 0 3.5 6.7C3.2 7.8 3 9.5 3 12s.2 4.2.5 5.3a2.5 2.5 0 0 0 1.8 1.8c1.1.3 6.7.3 6.7.3s5.6 0 6.7-.3a2.5 2.5 0 0 0 1.8-1.8c.3-1.1.5-2.8.5-5.3Z" fillRule="evenodd" clipRule="evenodd" opacity="0.25" />
                  </svg>
                </div>
                <span>{t.hero.cta}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>{lang === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{lang === 'fr' ? 'Résultats garantis' : 'Guaranteed results'}</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="flex-1 flex items-center justify-center mt-16 lg:mt-0">
            <div className="relative w-full max-w-md">
              {/* Animated Background Orbs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
              
              {/* Central Phone Mockup */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-64 h-[480px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl shadow-purple-500/20">
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-[2.5rem] overflow-hidden relative border border-gray-700">
                      {/* Phone Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
                      
                      {/* Phone Screen Content */}
                      <div className="pt-12 px-4 pb-4 h-full flex flex-col">
                        {/* Profile Section */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                              <path d="M10 8.5V15.5L16 12L10 8.5Z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">@viewplex</div>
                            <div className="text-purple-400 text-xs">Pro Account</div>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-2 text-center border border-gray-700/50">
                            <div className="text-white font-bold text-lg">12.5K</div>
                            <div className="text-purple-400 text-[10px]">Followers</div>
                          </div>
                          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-2 text-center border border-gray-700/50">
                            <div className="text-white font-bold text-lg">847</div>
                            <div className="text-purple-400 text-[10px]">Posts</div>
                          </div>
                          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-2 text-center border border-gray-700/50">
                            <div className="text-white font-bold text-lg">98%</div>
                            <div className="text-purple-400 text-[10px]">Growth</div>
                          </div>
                        </div>
                        
                        {/* Growth Chart */}
                        <div className="flex-1 bg-gray-800/30 backdrop-blur rounded-2xl p-3 relative overflow-hidden border border-gray-700/50">
                          <div className="text-purple-400 text-xs mb-2">Growth Analytics</div>
                          <div className="flex items-end gap-1 h-28">
                            {[40, 55, 45, 70, 60, 85, 75, 95, 88, 100].map((height, i) => (
                              <div 
                                key={i} 
                                className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-sm"
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Notification Cards */}
                  <div className="absolute -top-4 -left-16 bg-gray-800 rounded-2xl p-3 shadow-2xl shadow-purple-500/20 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                          <path d="M10 8.5V15.5L16 12L10 8.5Z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">+2,847</div>
                        <div className="text-[10px] text-gray-400">New followers</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-20 -right-20 bg-gray-800 rounded-2xl p-3 shadow-2xl shadow-cyan-500/20 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">+15.2K</div>
                        <div className="text-[10px] text-gray-400">Views today</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-24 -left-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-3 shadow-2xl shadow-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">+340%</div>
                        <div className="text-purple-200 text-[10px]">Engagement</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-12 -right-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-4 py-2 shadow-lg shadow-green-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span className="text-white text-xs font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.services.title}
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t.services.subtitle}
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mt-6" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.items.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <article
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.faq.title}
            </h2>
            <p className="text-lg text-gray-400">
              {t.faq.subtitle}
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mt-6" />
          </div>
          
          <dl className="space-y-4">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-colors"
              >
                <dt>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-white">
                      {item.question}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${openFaqIndex === index ? 'bg-purple-500 rotate-180' : 'bg-gray-700'}`}>
                      {openFaqIndex === index ? (
                        <Minus className="h-4 w-4 text-white" />
                      ) : (
                        <Plus className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  </button>
                </dt>
                {openFaqIndex === index && (
                  <dd className="px-6 pb-6 text-base leading-7 text-gray-400">
                    {item.answer}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Trusted Brands */}
      <TrustedBrands lang={lang} />

      {/* Reviews Section */}
      <ReviewsSection lang={lang} platform="all" />

      {/* Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}
