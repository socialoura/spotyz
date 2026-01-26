'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import GoalSelectionModal from '@/components/GoalSelectionModal';
import PaymentModal from '@/components/PaymentModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { Bot, Clock, Shield, Package, Megaphone, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import ChatWidget from '@/components/ChatWidget';
import ReviewsSection from '@/components/ReviewsSection';
import TrustedBrands from '@/components/TrustedBrands';

interface PageProps {
  params: { lang: string };
}

interface FollowerGoal {
  followers: number;
  price: number;
  originalPrice: number;
  discount: number;
  popular?: boolean;
}

export default function InstagramPage({ params }: PageProps) {
  const lang = params.lang as Language;
  
  // State management
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FollowerGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [showToast, setShowToast] = useState(false);

  const getCurrency = () => (lang === 'fr' ? 'eur' : 'usd');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove any @ symbols from the input
    value = value.replace(/@/g, '');
    setUsername(value);
  };

  const handleContinue = () => {
    if (username.trim().length > 0) {
      setIsGoalModalOpen(true);
    }
  };

  const handleGoalSelected = (goal: FollowerGoal, emailParam: string) => {
    setSelectedGoal(goal);
    setEmail(emailParam);
    setIsGoalModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentIntentIdParam: string) => {
    setPaymentIntentId(paymentIntentIdParam);
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    setShowToast(true);
    
    // Save order to database
    try {
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          platform: 'instagram',
          followers: selectedGoal?.followers || 0,
          amount: selectedGoal?.price || 0,
          paymentId: paymentIntentIdParam,
        }),
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
  };
  
  const content = {
    en: {
      hero: {
        title: 'ELEVATE YOUR PRESENCE ON',
        platform: 'INSTAGRAM',
        subtitle: 'Professional marketing solutions through our exclusive partner network — designed to expand your reach authentically.',
        badges: [
          { text: '100% Authentic approach' },
          { text: 'Safe & Private' },
          { text: 'Customer-approved' },
        ],
        cta: 'CONTINUE',
      },
      difference: {
        title: 'What makes Socialoura different?',
        cards: [
          {
            title: 'Authentic Marketing Only',
            description: 'We promote your content through real partnerships and strategic collaborations. Every interaction is genuine and compliant with platform guidelines.',
            icon: 'Bot'
          },
          {
            title: 'Time-saving solutions',
            description: 'Focus on creating great content while we handle the marketing strategy. Our professional approach saves you hours of networking time.',
            icon: 'Clock'
          },
          {
            title: 'Build credibility the right way',
            description: 'Strategic promotion through trusted channels builds real authority and engagement with your target audience.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'How it works',
        cards: [
          {
            number: '1',
            title: 'CHOOSE YOUR PACKAGE',
            description: 'Select the marketing support level that aligns with your goals. Our plans offer professional promotion through our exclusive partner network.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'WE MARKET YOUR CONTENT',
            description: 'We share your content through selected platforms, creators, and communities to reach people genuinely interested in your niche.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'TRACK THE IMPACT',
            description: 'Monitor your results through your dashboard as your content reaches new audiences and builds stronger visibility.',
            icon: 'BarChart3'
          },
        ],
        cta: 'START NOW',
      },
      benefits: {
        title: '(Re)take the control now',
        items: [
          'Greater visibility for your content',
          'Stronger presence across platforms',
          'Earn audience trust through consistent exposure',
          'Reach more people interested in your niche',
          'Professional and safe process',
        ],
      },
      pricing: {
        title: 'Test our subscription with our trial offer',
        plan: {
          name: 'PREMIUM',
          price: '$39.90',
          period: 'per month',
          features: [
            '24h trial to explore all features',
            'Audience research and targeting',
            'Content placement guidance',
            'Professional promotional outreach',
            'Strategic recommendations to improve reach',
          ],
          cta: 'SUBSCRIBE NOW',
        },
      },
      finalCta: {
        title: 'Much more than just a solution. A true partner in your success.',
        cta: 'START IT NOW',
      },
      compliance: {
        text: 'Compliance Disclaimer: All our services are based on authentic marketing strategies and visibility solutions in accordance with platform policies and terms of service.',
      },
    },
    fr: {
      hero: {
        title: 'ÉLEVEZ VOTRE PRÉSENCE SUR',
        platform: 'INSTAGRAM',
        subtitle: 'Solutions marketing professionnelles via notre réseau de partenaires exclusif — conçues pour étendre votre portée de manière authentique.',
        badges: [
          { text: 'Approche 100% authentique' },
          { text: 'Sûr et Privé' },
          { text: 'Approuvé par les clients' },
        ],
        cta: 'CONTINUER',
      },
      difference: {
        title: 'Qu\'est-ce qui rend Socialoura différent ?',
        cards: [
          {
            title: 'Marketing authentique uniquement',
            description: 'Nous promouvons votre contenu via de vrais partenariats et collaborations stratégiques. Chaque interaction est authentique et conforme aux directives de la plateforme.',
            icon: 'Bot'
          },
          {
            title: 'Solutions qui font gagner du temps',
            description: 'Concentrez-vous sur la création de contenu de qualité pendant que nous gérons la stratégie marketing. Notre approche professionnelle vous fait gagner des heures.',
            icon: 'Clock'
          },
          {
            title: 'Construisez votre crédibilité de la bonne manière',
            description: 'Une promotion stratégique via des canaux de confiance construit une vraie autorité et un engagement avec votre audience cible.',
            icon: 'Shield'
          },
        ],
      },
      howItWorks: {
        title: 'Comment ça marche',
        cards: [
          {
            number: '1',
            title: 'CHOISISSEZ VOTRE FORFAIT',
            description: 'Sélectionnez le niveau de support marketing qui correspond à vos objectifs. Nos plans offrent une promotion professionnelle via notre réseau partenaire exclusif.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'NOUS PROMOUVONS VOTRE CONTENU',
            description: 'Nous partageons votre contenu via des plateformes, créateurs et communautés sélectionnés pour atteindre les personnes vraiment intéressées par votre niche.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'SUIVEZ L\'IMPACT',
            description: 'Surveillez vos résultats via votre tableau de bord pendant que votre contenu atteint de nouvelles audiences et construit une visibilité plus forte.',
            icon: 'BarChart3'
          },
        ],
        cta: 'COMMENCER MAINTENANT',
      },
      benefits: {
        title: '(Re)prenez le contrôle maintenant',
        items: [
          'Plus grande visibilité pour votre contenu',
          'Présence plus forte sur les plateformes',
          'Gagnez la confiance de votre audience par une exposition cohérente',
          'Atteignez plus de personnes intéressées par votre niche',
          'Processus professionnel et sécurisé',
        ],
      },
      pricing: {
        title: 'Testez notre abonnement avec notre offre d\'essai',
        plan: {
          name: 'PREMIUM',
          price: '39,90€',
          period: 'par mois',
          features: [
            'Essai de 24h pour explorer toutes les fonctionnalités',
            'Recherche et ciblage d\'audience',
            'Conseils pour le placement de contenu',
            'Promotion professionnelle',
            'Recommandations stratégiques pour améliorer la portée',
          ],
          cta: 'S\'ABONNER MAINTENANT',
        },
      },
      finalCta: {
        title: 'Bien plus qu\'une simple solution. Un véritable partenaire dans votre succès.',
        cta: 'COMMENCEZ DÈS MAINTENANT',
      },
      compliance: {
        text: 'Avertissement de conformité : Tous nos services sont basés sur des stratégies marketing authentiques et des solutions de visibilité conformes aux politiques et conditions de la plateforme.',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative mx-auto max-w-5xl px-6 py-20 lg:px-8 w-full">
          <div className="text-center">
            {/* Platform Badge */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 mb-8 shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl mb-4 leading-tight">
              {t.hero.title}
            </h1>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl mb-8 leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              {t.hero.platform}
            </h1>
            <p className="text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto mb-10">
              {t.hero.subtitle}
            </p>
            
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {t.hero.badges.map((badge, index) => (
                <div key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Username Input & CTA Button */}
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder={lang === 'en' ? 'username' : 'nomutilisateur'}
                    className="w-full pl-10 pr-4 py-4 text-base bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.hero.cta}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
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
          </div>
        </div>
      </section>

      {/* What Makes Different Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.difference.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.difference.cards.map((card, index) => {
              const IconComponent = card.icon === 'Bot' ? Bot : card.icon === 'Clock' ? Clock : Shield;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.howItWorks.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {t.howItWorks.cards.map((card, index) => {
              const IconComponent = card.icon === 'Package' ? Package : card.icon === 'Megaphone' ? Megaphone : BarChart3;
              return (
                <div key={index} className="relative group">
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0" />
                  )}
                  
                  <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 h-full">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/30">
                      {index + 1}
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">
                        {card.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 uppercase tracking-wide group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t.howItWorks.cta}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-gray-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl mb-4">
              {t.benefits.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side: Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[0]}
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 flex items-center justify-center min-h-[160px] border border-gray-700 hover:border-purple-500/50 transition-colors">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[1]}
                </p>
              </div>
              
              {/* Card 3 - Full width */}
              <div className="col-span-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-6 flex items-center justify-center min-h-[140px] shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[2]}
                </p>
              </div>
              
              {/* Card 4 */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[3]}
                </p>
              </div>
              {/* Card 5 */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 flex items-center justify-center min-h-[160px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                <p className="text-white text-lg font-bold text-center leading-relaxed">
                  {t.benefits.items[4]}
                </p>
              </div>
            </div>
            
            {/* Right side: Image with overlay */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-700">
                <Image
                  src="/img/smiling-woman-using-her-phone-surrounded-by-social.webp"
                  alt="Woman using phone"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Disclaimer */}
      <section className="py-12 bg-gray-950 border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            {t.compliance.text}
          </p>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className="rounded-lg bg-green-600 dark:bg-green-500 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {lang === 'en' ? 'Payment Successful!' : 'Paiement Réussi !'}
                </p>
                <p className="text-xs text-green-50">
                  {lang === 'en' ? 'Your order has been confirmed' : 'Votre commande a été confirmée'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Selection Modal */}
      <GoalSelectionModal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        onSelectGoal={handleGoalSelected}
        username={username}
        platform="instagram"
        language={lang}
      />

      {/* Payment Modal */}
      {selectedGoal && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          amount={Math.round(selectedGoal.price * 100)} // Convert to cents and round to avoid floating point errors
          currency={getCurrency()}
          onClose={handleClosePaymentModal}
          onSuccess={handlePaymentSuccess}
          productName={`+${selectedGoal.followers} Instagram followers`}
          language={lang}
          email={email}
          orderDetails={{
            platform: 'instagram',
            followers: selectedGoal.followers,
            username: username,
          }}
        />
      )}

      {/* Order Success Modal */}
      {selectedGoal && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          paymentIntentId={paymentIntentId}
          productName={`+${selectedGoal.followers} Instagram followers`}
          amount={Math.round(selectedGoal.price * 100)}
          currency={getCurrency()}
          username={username}
          language={lang}
        />
      )}

      {/* Trusted Brands */}
      <TrustedBrands lang={lang} />

      {/* Reviews Section */}
      <ReviewsSection lang={lang} platform="instagram" />

      {/* Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}
