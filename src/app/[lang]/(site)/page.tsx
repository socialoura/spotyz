'use client';

import { useEffect, useState } from 'react';
import { Language } from '@/i18n/config';
import { useRouter } from 'next/navigation';
import { Plus, Minus, BarChart3, Calendar, MessageCircle, HeadphonesIcon, Music, CheckCircle2, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import ReviewsSection from '@/components/ReviewsSection';
import PaymentModal from '@/components/PaymentModal';

interface PageProps {
  params: { lang: string };
}

export default function HomePage({ params }: PageProps) {
  const lang = params.lang as Language;
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  type RegularPack = { views: number; label: string; amount: number; original?: number; badge?: string };

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{ views: number; amount: number } | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState<{ email: string; spotifyUrl: string } | null>(null);
  const [heroSelectionError, setHeroSelectionError] = useState<string>('');
  const [customStreams, setCustomStreams] = useState<number>(200);
  const [packsLoading, setPacksLoading] = useState(true);
  const [regularPacks, setRegularPacks] = useState<RegularPack[]>([]);

  const fallbackRegularPacks: RegularPack[] = [
    { views: 100, label: '100', amount: 149 },
    { views: 1000, label: '1.0k', amount: 440, original: 650, badge: lang === 'fr' ? '-32%' : 'save 32%' },
    { views: 2500, label: '2.5k', amount: 1090, original: 1600, badge: lang === 'fr' ? '-32%' : 'save 32%' },
    { views: 5000, label: '5.0k', amount: 2198, original: 3300, badge: lang === 'fr' ? '-33%' : 'save 33%' },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleHeroBuyNow = () => {
    if (!selectedPack) {
      setHeroSelectionError(lang === 'fr' ? 'Sélectionnez un pack pour continuer.' : 'Select a package to continue.');
      scrollToHero();
      return;
    }
    setHeroSelectionError('');
    setIsPaymentModalOpen(true);
  };

  const getCurrency = () => (lang === 'fr' ? 'eur' : 'usd');

  const formatStreamsLabel = (views: number) => {
    if (views >= 1000) {
      const value = views / 1000;
      const decimals = Number.isInteger(value) ? 0 : 1;
      return `${value.toFixed(decimals)}k`;
    }
    return views.toString();
  };

  useEffect(() => {
    let cancelled = false;

    const fetchPricing = async () => {
      try {
        if (!cancelled) setPacksLoading(true);
        const response = await fetch('/api/admin/pricing');
        if (!response.ok) {
          if (!cancelled) {
            setRegularPacks(fallbackRegularPacks);
            setPacksLoading(false);
          }
          return;
        }

        const data = await response.json();
        
        // Handle both formats: array from admin API or legacy {youtube/instagram} format
        let packagesArray: Array<{ impressions?: number; price?: number | string; original_price?: number | string; is_active?: boolean; followers?: string; originalPrice?: string }> = [];
        
        if (Array.isArray(data)) {
          // New format: direct array from /api/admin/pricing
          packagesArray = data.filter((pkg: { is_active?: boolean }) => pkg.is_active !== false);
        } else if (data.youtube || data.instagram) {
          // Legacy format
          packagesArray = data.youtube || data.instagram || [];
        }
        
        if (!packagesArray.length) {
          if (!cancelled) {
            setRegularPacks(fallbackRegularPacks);
            setPacksLoading(false);
          }
          return;
        }

        const dynamicPacks = packagesArray.reduce<RegularPack[]>((acc, pkg) => {
          // Support both new format (impressions/price/original_price) and legacy (followers/price/originalPrice)
          const views = pkg.impressions ?? parseInt(String(pkg.followers || '0'), 10);
          const priceRaw = pkg.price;
          const priceFloat = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw || '0'));
          if (!Number.isFinite(views) || views <= 0 || !Number.isFinite(priceFloat) || priceFloat <= 0) return acc;

          const amount = Math.round(priceFloat * 100);
          const label = formatStreamsLabel(views);
          
          const originalRaw = pkg.original_price ?? pkg.originalPrice;
          const originalFloat = typeof originalRaw === 'number' ? originalRaw : parseFloat(String(originalRaw || ''));
          const hasOriginal = Number.isFinite(originalFloat) && originalFloat > priceFloat;
          const original = hasOriginal ? Math.round(originalFloat * 100) : undefined;
          const discountPercentage = hasOriginal ? Math.round((1 - priceFloat / originalFloat) * 100) : 0;
          const badge = hasOriginal && discountPercentage > 0
            ? (lang === 'fr' ? `-${discountPercentage}%` : `save ${discountPercentage}%`)
            : undefined;

          acc.push({ views, label, amount, original, badge });
          return acc;
        }, []);

        if (!dynamicPacks.length) {
          if (!cancelled) {
            setRegularPacks(fallbackRegularPacks);
            setPacksLoading(false);
          }
          return;
        }

        // Sort by views ascending
        dynamicPacks.sort((a, b) => a.views - b.views);

        if (!cancelled) {
          setRegularPacks(dynamicPacks);
          setSelectedPack((prev) => {
            if (!prev) return prev;
            const updated = dynamicPacks.find((pack) => pack.views === prev.views);
            if (!updated) return prev;
            if (updated.amount === prev.amount) return prev;
            return { views: prev.views, amount: updated.amount };
          });
          setPacksLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRegularPacks(fallbackRegularPacks);
          setPacksLoading(false);
        }
      }
    };

    fetchPricing();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const handlePaymentSuccess = async (
    paymentIntentIdParam: string,
    details?: { email: string; spotifyUrl: string }
  ) => {
    setIsPaymentModalOpen(false);

    const email = details?.email || checkoutDetails?.email || '';
    const spotifyUrl = details?.spotifyUrl || checkoutDetails?.spotifyUrl || '';

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: spotifyUrl,
          email,
          platform: 'spotify',
          followers: selectedPack?.views || 0,
          amount: selectedPack?.amount || 0,
          paymentId: paymentIntentIdParam,
          spotifyUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('Order creation failed:', data);
      }
    } catch {
      console.error('Order creation failed');
    }

    // Redirect to thank-you page with all order details
    const thankYouParams = new URLSearchParams({
      payment_id: paymentIntentIdParam,
      email: email,
      views: String(selectedPack?.views || 0),
      amount: String(selectedPack?.amount || 0),
      video: checkoutDetails?.spotifyUrl || '',
    });
    router.push(`/${lang}/thank-you?${thankYouParams.toString()}`);
  };
  
  const content = {
    en: {
      hero: {
        headline: 'Spotify Music Visibility',
        subheadline: 'Choose a streams package, paste your track link, and run a compliant visibility campaign with secure checkout.',
        cta: 'Start visibility campaign',
      },
      services: {
        title: 'Our Services',
        subtitle: 'A simple workflow designed for Spotify music discovery',
        items: [
          {
            title: 'Visibility Packages',
            description: 'Select an exposure level aligned with your goals. We focus on reach and discovery, not artificial engagement.',
            icon: BarChart3,
          },
          {
            title: 'Fast Delivery',
            description: 'Campaigns start quickly after payment and are delivered progressively for a natural-looking distribution.',
            icon: Calendar,
          },
          {
            title: 'Secure Payments',
            description: 'Checkout securely by credit card. No password needed, only your track link.',
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
        subtitle: 'Everything you need to know about our visibility packages',
        items: [
          {
            question: 'Is your service safe for my account?',
            answer: 'We use a compliant, marketing-first approach focused on visibility and discovery. You never share your password with us.',
          },
          {
            question: 'How quickly will I see results?',
            answer: 'Most campaigns start quickly after checkout. Results depend on content quality, niche relevance, and consistency.',
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
            answer: 'We currently focus on Spotify music visibility packages.',
          },
        ],
      },
    },
    fr: {
      hero: {
        headline: 'Visibilité de votre musique Spotify',
        subheadline: 'Choisissez un forfait de streams, collez le lien de votre titre et lancez une campagne de visibilité avec paiement sécurisé.',
        cta: 'Lancer la campagne',
      },
      services: {
        title: 'Nos Services',
        subtitle: 'Un parcours simple pensé pour la découverte sur Spotify',
        items: [
          {
            title: 'Forfaits de visibilité',
            description: 'Choisissez un niveau d\'exposition selon vos objectifs. Nous privilégions la portée et la découverte, pas l\'engagement artificiel.',
            icon: BarChart3,
          },
          {
            title: 'Livraison rapide',
            description: 'Les campagnes démarrent rapidement après paiement et sont livrées progressivement pour une diffusion naturelle.',
            icon: Calendar,
          },
          {
            title: 'Paiement sécurisé',
            description: 'Paiement sécurisé par carte bancaire. Aucun mot de passe requis, seulement le lien du titre.',
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
        subtitle: 'Tout ce que vous devez savoir sur nos forfaits de visibilité',
        items: [
          {
            question: 'Votre service est-il sûr pour mon compte ?',
            answer: 'Notre approche est marketing-first et axée sur la visibilité et la découverte. Vous ne partagez jamais votre mot de passe.',
          },
          {
            question: 'À quelle vitesse verrai-je des résultats ?',
            answer: 'La plupart des campagnes démarrent rapidement après paiement. Les résultats dépendent du contenu, de la niche et de la régularité.',
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
            answer: 'Nous proposons actuellement des forfaits de visibilité pour la musique sur Spotify.',
          },
        ],
      },
    },
  };

  const t = content[lang];
  const serviceItems = t.services.items;

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatHeroPrice = (amount: number) => {
    const value = amount / 100;
    if (getCurrency() === 'eur') {
      return `${value.toFixed(2)}€`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_20%,rgba(29,185,84,0.15),transparent_55%),radial-gradient(900px_circle_at_90%_35%,rgba(29,185,84,0.10),transparent_55%)] animate-pulse-glow" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1DB954]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        </div>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(2,6,23,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30 dark:opacity-15" />
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(60%_55%_at_50%_35%,black,transparent)] bg-gradient-to-b from-white/0 via-white/40 to-white dark:from-gray-950/0 dark:via-gray-950/70 dark:to-gray-950" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-8 pb-8 sm:pt-14 sm:pb-12 lg:px-8 lg:pt-20 lg:pb-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-5 animate-slide-up">
              {/* Animated badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 shadow-sm dark:border-emerald-900 dark:from-emerald-950/50 dark:to-green-950/50 animate-scale-in">
                <div className="h-2 w-2 rounded-full bg-[#1DB954] animate-pulse" />
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  {lang === 'fr' ? '🎵 Plateforme #1 pour artistes' : '🎵 #1 Platform for Artists'}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-gray-100 dark:to-white animate-gradient">
                    {lang === 'fr' ? 'Boostez' : 'Boost'}
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#1DB954] via-emerald-500 to-[#1ed760] bg-clip-text text-transparent animate-gradient">
                    {lang === 'fr' ? 'votre musique' : 'your music'}
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-gray-100 dark:to-white animate-gradient">
                    {lang === 'fr' ? 'sur Spotify' : 'on Spotify'}
                  </span>
                </h1>
              </div>

              <p className="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300 animate-slide-up animate-delay-100">
                {lang === 'fr'
                  ? 'Spotyz vous aide à booster la visibilité de vos titres sur Spotify. Choisissez un pack de streams, payez en toute sécurité et démarrez rapidement.'
                  : 'Spotyz helps you boost the visibility of your tracks on Spotify. Choose a streams pack, checkout securely, and get started fast.'}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 animate-slide-up animate-delay-200">
                <div className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700">
                  <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/30">
                    <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
                </div>
                <div className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700">
                  <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Qualité élevée' : 'High quality'}</span>
                </div>
                <div className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700">
                  <div className="rounded-lg bg-gray-100 p-1.5 dark:bg-gray-800">
                    <Zap className="h-4 w-4 text-gray-900 dark:text-gray-200" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Démarrage rapide' : 'Instant start'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 animate-slide-up animate-delay-300">
              <div className="group relative rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-emerald-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-800">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1DB954]/5 via-emerald-500/5 to-[#1ed760]/5 blur-xl" />
                </div>
                
                <div className="relative border-b border-gray-200 bg-gradient-to-r from-gray-50 to-emerald-50/30 px-6 py-4 dark:border-gray-800 dark:from-gray-900 dark:to-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-[#1DB954]" />
                      <div className="text-sm font-black text-gray-900 dark:text-white">
                        {lang === 'fr' ? 'Choisissez vos Streams' : 'Choose your Streams'}
                      </div>
                    </div>
                    <div className="rounded-full bg-[#1DB954]/10 px-3 py-1 text-xs font-bold text-[#1DB954]">
                      {lang === 'fr' ? 'Populaire' : 'Popular'}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <span className="font-bold">{lang === 'fr' ? 'Info' : 'Info'}:</span>{' '}
                    {lang === 'fr'
                      ? 'Choisissez un pack. Le paiement s\'ouvre ensuite et vous ajoutez votre email + lien Spotify.'
                      : 'Pick a pack. Checkout opens next and you’ll add your email + Spotify link.'}
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {packsLoading ? (
                      Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={`regular-skeleton-${index}`}
                          className="animate-pulse rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                              <div className="mt-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                            </div>
                            <div className="h-5 w-14 rounded bg-gray-200 dark:bg-gray-800" />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-800" />
                          </div>
                        </div>
                      ))
                    ) : (
                      regularPacks.map((offer) => {
                        const isSelected = selectedPack?.views === offer.views;
                        return (
                          <button
                            key={`regular-${offer.views}-${offer.amount}`}
                            type="button"
                            onClick={() => {
                              setHeroSelectionError('');
                              setSelectedPack({ views: offer.views, amount: offer.amount });
                            }}
                            className={`group relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 hover-lift ${
                              isSelected
                                ? 'border-[#1DB954] bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/20 dark:from-emerald-950/40 dark:to-green-950/40 dark:shadow-emerald-500/10'
                                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-700'
                            }`}
                          >
                            {/* Animated gradient background */}
                            <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}`}>
                              <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_50%,rgba(29,185,84,0.15),transparent_70%)] animate-pulse-glow" />
                            </div>
                            
                            {/* Shine effect on hover */}
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>

                            <div className="relative flex items-center justify-between">
                              <div>
                                {offer.badge && (
                                  <div className="mb-2">
                                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1DB954] to-emerald-500 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-md shadow-emerald-500/30 animate-glow-pulse">
                                      <span className="mr-1">🔥</span>
                                      {offer.badge}
                                    </div>
                                  </div>
                                )}
                                <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white transition-colors group-hover:text-[#1DB954]">
                                  {offer.label}
                                </div>
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  {lang === 'fr' ? 'streams' : 'streams'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm sm:text-base font-black text-[#1DB954]">
                                  {formatHeroPrice(offer.amount)}
                                </div>
                                {offer.original && (
                                  <div className="text-xs text-gray-400 line-through dark:text-gray-500">
                                    {formatHeroPrice(offer.original)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">{lang === 'fr' ? 'Sélectionner' : 'Select'}</span>
                              <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-[#1DB954]' : 'bg-gray-200 dark:bg-gray-800'}`} />
                            </div>
                          </button>
                        );
                      })
                    )}
                    {(() => {
                      const customAmount = Math.round(customStreams * 0.4);
                      const isCustomSelected = selectedPack?.views === customStreams;

                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setHeroSelectionError('');
                            setSelectedPack({ views: customStreams, amount: customAmount });
                          }}
                          className={`group relative col-span-full overflow-hidden rounded-2xl border px-5 py-5 text-left transition-all duration-300 hover-lift ${
                            isCustomSelected
                              ? 'border-[#1DB954] bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/20 dark:from-emerald-950/40 dark:to-green-950/40 dark:shadow-emerald-500/10'
                              : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-700'
                          }`}
                        >
                          {/* Animated gradient background */}
                          <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${isCustomSelected ? 'opacity-100' : 'group-hover:opacity-100'}`}>
                            <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_50%,rgba(29,185,84,0.15),transparent_70%)] animate-pulse-glow" />
                          </div>
                          
                          {/* Shine effect on hover */}
                          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>

                          <div className="relative flex items-start justify-between gap-6">
                            <div>
                              <div className="mb-2">
                                <div className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-900 to-gray-700 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-wider shadow-md dark:from-gray-800 dark:to-gray-700">
                                  <span className="mr-1">⚡</span>
                                  {lang === 'fr' ? 'Personnalisé' : 'Custom'}
                                </div>
                              </div>
                              <div className="text-xl font-black text-gray-900 transition-colors group-hover:text-[#1DB954] dark:text-white">
                                {formatStreamsLabel(customStreams)}
                              </div>
                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {lang === 'fr' ? 'streams' : 'streams'}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xl font-black text-[#1DB954]">
                                {formatHeroPrice(customAmount)}
                              </div>
                              <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                {lang === 'fr' ? 'Estimation' : 'Estimate'}
                              </div>
                            </div>
                          </div>

                          <div className="mt-5">
                            <input
                              type="range"
                              min={200}
                              max={1000000}
                              step={100}
                              value={customStreams}
                              onChange={(e) => {
                                const next = parseInt(e.target.value, 10);
                                if (!Number.isFinite(next)) return;
                                setHeroSelectionError('');
                                setCustomStreams(next);
                                setSelectedPack({ views: next, amount: Math.round(next * 0.4) });
                              }}
                              className="slider w-full"
                            />

                            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                              <span>100</span>
                              <span>250k</span>
                              <span>500k</span>
                              <span>750k</span>
                              <span>1M</span>
                            </div>
                          </div>
                        </button>
                      );
                    })()}
                  </div>

                  {heroSelectionError && (
                    <div className="mt-4 text-sm text-emerald-700 dark:text-emerald-200">
                      {heroSelectionError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleHeroBuyNow}
                    className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#1DB954] via-emerald-500 to-[#1ed760] p-[2px] transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50 animate-gradient"
                  >
                    <div className="relative rounded-2xl bg-gradient-to-r from-[#1DB954] to-emerald-600 px-6 py-4 transition-all group-hover:from-emerald-600 group-hover:to-[#1DB954]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-base font-black text-white">
                          {lang === 'fr' ? 'Acheter maintenant' : 'Buy now'}
                        </span>
                        <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                      </div>
                      {/* Shine effect */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </div>
                    </div>
                  </button>

                  <div className="mt-4 hidden grid-cols-2 gap-3 border-t border-gray-200 pt-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200 sm:grid">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />
                      <span>{lang === 'fr' ? 'Promotion sur Spotify' : 'Spotify promotion'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />
                      <span>{lang === 'fr' ? 'Streams progressifs & naturels' : 'Progressive & natural streams'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />
                      <span>{lang === 'fr' ? 'Démarrage rapide' : 'Instant start'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />
                      <span>{lang === 'fr' ? 'Confidentialité & sécurité' : 'Privacy & safety'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-6 sm:py-12 lg:py-16 bg-white relative overflow-hidden dark:bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_30%,rgba(29,185,84,0.06),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-4 dark:text-white">
              {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              {lang === 'fr'
                ? 'Sélectionnez un pack, renseignez votre email + lien Spotify, puis payez en toute sécurité.'
                : 'Select a package, add your email + Spotify link, then checkout securely.'}
            </p>
            <div className="w-20 h-1 bg-[#1DB954] mx-auto rounded-full mt-6" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
                  <BarChart3 className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{lang === 'fr' ? '1) Pack' : '1) Package'}</div>
                  <div className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                    {lang === 'fr'
                      ? 'Choisissez votre niveau de streams. Les packs viennent directement depuis l’admin.'
                      : 'Choose the streams package that fits your goal. Packages are loaded from admin pricing.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                  <Music className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{lang === 'fr' ? '2) Infos' : '2) Details'}</div>
                  <div className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                    {lang === 'fr'
                      ? 'Dans le paiement, ajoutez votre email et le lien de votre titre Spotify.'
                      : 'Inside checkout, add your email and your Spotify track link.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                  <ShieldCheck className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{lang === 'fr' ? '3) Paiement' : '3) Checkout'}</div>
                  <div className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                    {lang === 'fr'
                      ? 'Paiement sécurisé par carte bancaire, puis démarrage rapide et confirmation.'
                      : 'Secure credit card checkout, then fast start and confirmation.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-base font-black text-gray-900 dark:text-white">{lang === 'fr' ? 'Transparence & conformité' : 'Transparency & compliance'}</div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 max-w-3xl dark:text-gray-300">
              {lang === 'fr'
                ? 'Nous mettons l\'accent sur la visibilité et la découverte. Les résultats dépendent du contenu, de la niche et de la régularité. Nous ne promettons pas de métriques spécifiques.'
                : 'We focus on visibility and discovery. Results depend on content quality, niche relevance, and consistency. We do not promise specific metrics.'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 relative overflow-hidden dark:bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_20%,rgba(29,185,84,0.06),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-4 dark:text-white">
              {lang === 'fr' ? 'Comparaison' : 'Comparison'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              {lang === 'fr'
                ? 'Une approche orientée visibilité et découverte, avec un setup simple et un paiement sécurisé.'
                : 'A visibility and discovery-oriented approach, with simple setup and secure checkout.'}
            </p>
            <div className="w-20 h-1 bg-[#1DB954] mx-auto rounded-full mt-6" />
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-4 gap-0 border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <div className="p-5 text-sm font-bold text-gray-600 dark:text-gray-300">{lang === 'fr' ? 'Critère' : 'Criteria'}</div>
                  <div className="p-5 text-sm font-black text-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/25 dark:text-emerald-200">Spotyz</div>
                  <div className="p-5 text-sm font-bold text-gray-600 dark:text-gray-300">{lang === 'fr' ? 'Sponsoring' : 'Sponsorships'}</div>
                  <div className="p-5 text-sm font-bold text-gray-600 dark:text-gray-300">{lang === 'fr' ? 'Options aléatoires' : 'Random options'}</div>
                </div>

                {[
                  {
                    label: lang === 'fr' ? 'Mise en place' : 'Setup',
                    a: lang === 'fr' ? 'En quelques minutes' : 'In minutes',
                    b: lang === 'fr' ? 'Variable' : 'Varies',
                    c: lang === 'fr' ? 'Souvent longue' : 'Often slow',
                    okA: true,
                    okB: false,
                    okC: false,
                  },
                  {
                    label: lang === 'fr' ? 'Paiement sécurisé' : 'Secure payment',
                    a: lang === 'fr' ? 'Carte bancaire' : 'Credit Card',
                    b: lang === 'fr' ? 'Pas toujours' : 'Not always',
                    c: lang === 'fr' ? 'Pas clair' : 'Unclear',
                    okA: true,
                    okB: false,
                    okC: false,
                  },
                  {
                    label: lang === 'fr' ? 'Accès au compte requis' : 'Account access required',
                    a: lang === 'fr' ? 'Non' : 'No',
                    b: lang === 'fr' ? 'Parfois' : 'Sometimes',
                    c: lang === 'fr' ? 'Parfois' : 'Sometimes',
                    okA: true,
                    okB: false,
                    okC: false,
                  },
                  {
                    label: lang === 'fr' ? 'Rythme progressif' : 'Progressive pacing',
                    a: lang === 'fr' ? 'Oui' : 'Yes',
                    b: lang === 'fr' ? 'Variable' : 'Varies',
                    c: lang === 'fr' ? 'Non' : 'No',
                    okA: true,
                    okB: false,
                    okC: false,
                  },
                  {
                    label: lang === 'fr' ? 'Support' : 'Support',
                    a: '24/7',
                    b: lang === 'fr' ? 'Selon le partenaire' : 'Partner-dependent',
                    c: lang === 'fr' ? 'Limité' : 'Limited',
                    okA: true,
                    okB: false,
                    okC: false,
                  },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-0 border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                    <div className="p-5 text-sm font-semibold text-gray-900 dark:text-white">{row.label}</div>
                    <div className="p-5 text-sm text-gray-700 flex items-center justify-between gap-3">
                      <span className="truncate">{row.a}</span>
                      {row.okA ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-gray-300" />}
                    </div>
                    <div className="p-5 text-sm text-gray-700 flex items-center justify-between gap-3">
                      <span className="truncate">{row.b}</span>
                      {row.okB ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-gray-300" />}
                    </div>
                    <div className="p-5 text-sm text-gray-700 flex items-center justify-between gap-3">
                      <span className="truncate">{row.c}</span>
                      {row.okC ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-gray-300" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={scrollToHero}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1DB954] hover:bg-emerald-600 px-7 py-4 text-base font-black text-white shadow-sm transition-all"
            >
              <span>{lang === 'fr' ? 'Lancer une campagne' : 'Start a campaign'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-8 sm:py-12 lg:py-16 bg-gray-50 relative overflow-hidden dark:bg-gray-950">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1DB954]/5 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-4 dark:text-white">
              {t.faq.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t.faq.subtitle}
            </p>
            <div className="w-20 h-1 bg-[#1DB954] mx-auto rounded-full mt-6" />
          </div>
          
          <dl className="space-y-4">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors shadow-sm dark:bg-gray-950 dark:border-gray-800 dark:hover:border-gray-700"
              >
                <dt>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-50 transition-colors dark:hover:bg-gray-900"
                  >
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.question}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${openFaqIndex === index ? 'bg-[#1DB954] rotate-180' : 'bg-gray-100'}`}>
                      {openFaqIndex === index ? (
                        <Minus className="h-4 w-4 text-white" />
                      ) : (
                        <Plus className="h-4 w-4 text-gray-700" />
                      )}
                    </div>
                  </button>
                </dt>
                {openFaqIndex === index && (
                  <dd className="px-6 pb-6 text-base leading-7 text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="services" className="py-8 sm:py-12 lg:py-16 bg-white relative overflow-hidden dark:bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(29,185,84,0.08),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-4 dark:text-white">
              {lang === 'fr' ? 'Choisissez votre forfait' : 'Choose your package'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              {lang === 'fr'
                ? 'Des options simples pour lancer une campagne de visibilité vidéo. Vous gardez le contrôle et la mise en place est rapide.'
                : 'Simple options to start a video visibility campaign. You stay in control and setup is fast.'}
            </p>
            <div className="w-20 h-1 bg-[#1DB954] mx-auto rounded-full mt-6" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 opacity-60 dark:from-gray-200 dark:via-gray-400 dark:to-gray-200" />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_0%,rgba(29,185,84,0.10),transparent_60%)]" />
              </div>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{lang === 'fr' ? 'Starter' : 'Starter'}</div>
                  <div className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                    {lang === 'fr' ? '9,90€' : '$9.90'}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {lang === 'fr' ? 'Pour tester et valider le flow.' : 'For testing and validating the flow.'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center dark:bg-gray-900 dark:border-gray-800">
                  <Zap className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Démarrage rapide' : 'Fast start'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Exposition progressive' : 'Progressive exposure'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Paiement sécurisé par carte bancaire' : 'Secure credit card checkout'}</span>
                </div>
              </div>

              <button
                onClick={scrollToHero}
                className="mt-8 w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-black py-3 px-5 transition-all hover:shadow-sm active:scale-[0.99]"
              >
                {lang === 'fr' ? 'Commencer' : 'Get started'}
              </button>
              <div className="mt-3 text-xs text-gray-500 text-center dark:text-gray-400">
                {lang === 'fr' ? 'Sélectionnez un pack en haut pour ouvrir le paiement.' : 'Select a package at the top to open checkout.'}
              </div>
            </div>

            <div className="group relative overflow-visible rounded-3xl border-2 border-emerald-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-950 dark:border-emerald-900">
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_0%,rgba(29,185,84,0.18),transparent_60%)]" />
              </div>
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="rounded-full bg-[#1DB954] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-sm ring-1 ring-emerald-700/20">
                  {lang === 'fr' ? 'Populaire' : 'Most popular'}
                </div>
              </div>

              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{lang === 'fr' ? 'Plus' : 'Plus'}</div>
                  <div className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                    {lang === 'fr' ? '29,90€' : '$29.90'}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {lang === 'fr' ? 'Un bon équilibre pour booster la découverte.' : 'A balanced option to boost discovery.'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center dark:bg-emerald-950/40 dark:border-emerald-900">
                  <BarChart3 className="w-6 h-6 text-emerald-700" />
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Exposition renforcée' : 'Enhanced exposure'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Pacing progressif' : 'Progressive pacing'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Support prioritaire' : 'Priority support'}</span>
                </div>
              </div>

              <button
                onClick={scrollToHero}
                className="mt-8 w-full rounded-xl bg-[#1DB954] hover:bg-emerald-600 text-white font-black py-3 px-5 transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
              >
                {lang === 'fr' ? 'Choisir Plus' : 'Choose Plus'}
              </button>
              <div className="mt-3 text-xs text-gray-500 text-center dark:text-gray-400">
                {lang === 'fr' ? 'Sélectionnez ensuite un pack et payez en toute sécurité.' : 'Then select a pack and checkout securely.'}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 dark:from-gray-800 dark:via-gray-600 dark:to-gray-800" />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_0%,rgba(29,185,84,0.10),transparent_60%)]" />
              </div>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{lang === 'fr' ? 'Pro' : 'Pro'}</div>
                  <div className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                    {lang === 'fr' ? '59,90€' : '$59.90'}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {lang === 'fr' ? 'Pour les lancements et contenus importants.' : 'For launches and important content.'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center dark:bg-gray-900 dark:border-gray-800">
                  <ShieldCheck className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Volume d’exposition élevé' : 'Higher exposure volume'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Suivi et accompagnement' : 'Tracking and guidance'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-200">{lang === 'fr' ? 'Paiement sécurisé par carte bancaire' : 'Secure credit card checkout'}</span>
                </div>
              </div>

              <button
                onClick={scrollToHero}
                className="mt-8 w-full rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-3 px-5 transition-all hover:shadow-sm active:scale-[0.99] dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white"
              >
                {lang === 'fr' ? 'Contacter' : 'Contact'}
              </button>
              <div className="mt-3 text-xs text-gray-500 text-center dark:text-gray-400">
                {lang === 'fr' ? 'Idéal pour une stratégie plus complète.' : 'Ideal for a more complete strategy.'}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {(serviceItems || []).slice(0, 3).map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={`${item.title}-${idx}`} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center dark:bg-gray-950 dark:border-gray-800">
                      <IconComponent className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900 dark:text-white">{item.title}</div>
                      <div className="mt-1 text-sm text-gray-600 leading-relaxed dark:text-gray-300">{item.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-10 sm:py-14 bg-white relative overflow-hidden dark:bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_50%,rgba(29,185,84,0.06),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              {lang === 'fr' ? 'Avis' : 'Reviews'}
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {lang === 'fr' ? 'Retours d\'expérience sur nos campagnes.' : 'Feedback on our campaigns.'}
            </p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <ReviewsSection lang={lang} platform="all" />
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget lang={lang} />

      {/* Payment Modal */}
      {!!selectedPack && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          amount={selectedPack.amount}
          currency={getCurrency()}
          onClose={() => setIsPaymentModalOpen(false)}
          onCollectedDetails={(details) => setCheckoutDetails(details)}
          onSuccess={handlePaymentSuccess}
          productName={`${lang === 'fr' ? 'Pack' : 'Package'} — ${formatStreamsLabel(selectedPack.views)} ${lang === 'fr' ? 'vues' : 'views'}`}
          language={lang}
          orderDetails={{
            platform: 'spotify',
            followers: selectedPack.views,
            username: '',
          }}
        />
      )}
    </div>
  );
}
