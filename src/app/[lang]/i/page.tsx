'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import GoalSelectionModal from '@/components/GoalSelectionModal';
import PaymentModal from '@/components/PaymentModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { Bot, Clock, Shield, Package, Megaphone, BarChart3, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

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
  const [openDifferenceIndex, setOpenDifferenceIndex] = useState<number | null>(null);

  const toggleDifference = (index: number) => {
    setOpenDifferenceIndex(openDifferenceIndex === index ? null : index);
  };

  const getCurrency = () => (lang === 'fr' ? 'eur' : 'usd');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove any @ symbols from the input
    value = value.replace(/@/g, '');
    setUsername(value);
  };

  const handleContinue = () => {
    if (username.trim().length >= 3) {
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
        title: 'BOOST YOUR VISIBILITY ON',
        platform: 'INSTAGRAM',
        subtitle: 'No bots. No fake accounts. Only real visibility through our private partner network — fully compliant with platform policies.',
        badges: [
          { text: 'No bots, no automation' },
          { text: 'Safe & Private' },
          { text: 'Customer-approved' },
        ],
        cta: 'CONTINUE',
      },
      difference: {
        title: 'What makes Socialoura different?',
        cards: [
          {
            title: 'No bots. No automation.',
            description: 'We promote your content through real people in our partner network. Every interaction is genuine and compliant with platform guidelines.',
            icon: 'Bot'
          },
          {
            title: 'Time-saving visibility',
            description: 'Focus on creating great content while we handle the promotion. Our manual outreach saves you hours of networking time.',
            icon: 'Clock'
          },
          {
            title: 'Build credibility the right way',
            description: 'Authentic promotion through trusted channels builds real authority and engagement with your target audience.',
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
            description: 'Select the level of visibility support that aligns with your goals. Our plan offers manual promotion through our private partner network.',
            icon: 'Package'
          },
          {
            number: '2',
            title: 'WE PROMOTE YOUR CONTENT',
            description: 'We share your content through selected platforms, creators, and communities to reach people genuinely interested in your niche.',
            icon: 'Megaphone'
          },
          {
            number: '3',
            title: 'TRACK THE IMPACT',
            description: 'Monitor your results through your dashboard as your content reaches new audiences and builds stronger visibility — all while staying compliant.',
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
          'Compliant and safe process',
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
            'Human-led promotional outreach',
            'Strategic recommendations to improve reach',
          ],
          cta: 'SUBSCRIBE NOW',
        },
      },
      finalCta: {
        title: 'Much more than just a solution. A true partner in your growth.',
        cta: 'START IT NOW',
      },
      compliance: {
        text: 'Compliance Disclaimer: we do not engage in or support the sale of followers, likes, or paid engagement. All services are based on organic outreach and visibility strategies in accordance with platform policies and terms.',
      },
    },
    fr: {
      hero: {
        title: 'BOOSTEZ VOTRE VISIBILITÉ SUR',
        platform: 'INSTAGRAM',
        subtitle: 'Pas de bots. Pas de faux comptes. Seulement une visibilité réelle via notre réseau de partenaires privés — entièrement conforme aux politiques de la plateforme.',
        badges: [
          { text: 'Pas de bots, pas d\'automation' },
          { text: 'Sûr et Privé' },
          { text: 'Approuvé par les clients' },
        ],
        cta: 'CONTINUER',
      },
      difference: {
        title: 'Qu\'est-ce qui rend Socialoura différent ?',
        cards: [
          {
            title: 'Pas de bots. Pas d\'automation.',
            description: 'Nous promouvons votre contenu via de vraies personnes dans notre réseau partenaire. Chaque interaction est authentique et conforme aux directives de la plateforme.',
            icon: 'Bot'
          },
          {
            title: 'Visibilité efficace sans perte de temps',
            description: 'Concentrez-vous sur la création de contenu de qualité pendant que nous gérons la promotion. Notre approche manuelle vous fait gagner des heures de réseautage.',
            icon: 'Clock'
          },
          {
            title: 'Construisez votre crédibilité de la bonne manière',
            description: 'Une promotion authentique via des canaux de confiance construit une vraie autorité et un engagement avec votre audience cible.',
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
            description: 'Sélectionnez le niveau de support de visibilité qui correspond à vos objectifs. Notre plan offre une promotion manuelle via notre réseau partenaire privé.',
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
            description: 'Surveillez vos résultats via votre tableau de bord pendant que votre contenu atteint de nouvelles audiences et construit une visibilité plus forte — tout en restant conforme.',
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
          'Processus conforme et sécurisé',
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
            'Promotion manuelle dirigée par des humains',
            'Recommandations stratégiques pour améliorer la portée',
          ],
          cta: 'S\'ABONNER MAINTENANT',
        },
      },
      finalCta: {
        title: 'Bien plus qu\'une simple solution. Un véritable partenaire dans votre croissance.',
        cta: 'COMMENCEZ DÈS MAINTENANT',
      },
      compliance: {
        text: 'Avertissement de conformité : nous ne nous engageons pas et ne soutenons pas la vente d\'abonnés, de j\'aime ou d\'engagement payé. Tous les services sont basés sur des stratégies de sensibilisation organique et de visibilité conformes aux politiques et conditions de la plateforme.',
      },
    },
  };

  const t = content[lang];

  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl mb-2 leading-tight uppercase">
              {t.hero.title}
            </h1>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl mb-8 leading-tight uppercase bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t.hero.platform}
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>
            
            {/* Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {t.hero.badges.map((badge, index) => (
                <div key={index} className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Username Input & CTA Button */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base font-medium">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder={lang === 'en' ? 'username' : 'nomutilisateur'}
                    minLength={3}
                    className="w-full pl-10 pr-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  disabled={username.trim().length < 3}
                  className="rounded-lg bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-3 text-base font-bold text-white dark:text-black transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {t.hero.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Different Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t.difference.title}
            </h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <dl className="space-y-4">
              {t.difference.cards.map((card, index) => {
                const IconComponent = card.icon === 'Bot' ? Bot : card.icon === 'Clock' ? Clock : Shield;
                return (
                  <div
                    key={index}
                    className="rounded-lg bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden"
                  >
                    <dt>
                      <button
                        onClick={() => toggleDifference(index)}
                        className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {card.title}
                          </span>
                        </div>
                        {openDifferenceIndex === index ? (
                          <Minus className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        ) : (
                          <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                    </dt>
                    {openDifferenceIndex === index && (
                      <dd className="px-6 pb-6 pl-[88px] text-base leading-7 text-gray-600 dark:text-gray-400">
                        {card.description}
                      </dd>
                    )}
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t.howItWorks.title}
            </h2>
          </div>
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {t.howItWorks.cards.map((card, index) => {
                const IconComponent = card.icon === 'Package' ? Package : card.icon === 'Megaphone' ? Megaphone : BarChart3;
                return (
                  <div key={index} className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white dark:text-black" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 tracking-widest uppercase">
                      {card.title}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-lg bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-3 text-base font-bold text-white dark:text-black transition-colors uppercase tracking-wide"
            >
              {t.howItWorks.cta}
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section - (Re)prenez le contrôle maintenant */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-8">
              {t.benefits.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left side: Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1: 2 columns */}
              <div className="bg-orange-500 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                <p className="text-white text-xl font-semibold text-center leading-relaxed tracking-wide">
                  {t.benefits.items[0]}
                </p>
              </div>
              <div className="bg-black rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                <p className="text-white text-xl font-semibold text-center leading-relaxed tracking-wide">
                  {t.benefits.items[1]}
                </p>
              </div>
              
              {/* Row 2: 1 column spanning 2 */}
              <div className="md:col-span-2 bg-blue-500 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                <p className="text-white text-xl font-semibold text-center leading-relaxed tracking-wide">
                  {t.benefits.items[2]}
                </p>
              </div>
              
              {/* Row 3: 2 columns */}
              <div className="bg-pink-500 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                <p className="text-white text-xl font-semibold text-center leading-relaxed tracking-wide">
                  {t.benefits.items[3]}
                </p>
              </div>
              <div className="bg-yellow-500 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                <p className="text-white text-xl font-semibold text-center leading-relaxed tracking-wide">
                  {t.benefits.items[4]}
                </p>
              </div>
            </div>
            
            {/* Right side: Image */}
            <div className="relative lg:sticky lg:top-8">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/img/smiling-woman-using-her-phone-surrounded-by-social.webp"
                  alt="Woman using phone"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Disclaimer */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 leading-relaxed">
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
    </div>
  );
}
