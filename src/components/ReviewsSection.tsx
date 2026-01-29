'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/i18n/config';

interface ReviewsSectionProps {
  lang: Language;
  platform?: 'youtube' | 'all';
}

interface Review {
  id: number;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  platform: 'youtube';
  views: string;
  text: {
    en: string;
    fr: string;
  };
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah M.',
    username: '@sarahcreates',
    avatar: 'SM',
    rating: 5,
    platform: 'youtube',
    views: '+25k',
    text: {
      en: 'Super smooth checkout and the campaign started fast. My video picked up more views and the pacing looked natural. Great experience.',
      fr: 'Paiement super simple et la campagne a démarré rapidement. Ma vidéo a pris plus de vues avec un rythme naturel. Très bonne expérience.',
    },
    date: '2 days ago',
    verified: true,
  },
  {
    id: 2,
    name: 'Marcus J.',
    username: '@marcusfit',
    avatar: 'MJ',
    rating: 5,
    platform: 'youtube',
    views: '+50k',
    text: {
      en: 'Perfect for a new upload. I chose a package, added my YouTube link at checkout, and everything was handled quickly. Support was responsive too.',
      fr: 'Parfait pour une nouvelle vidéo. J\'ai choisi un pack, ajouté mon lien YouTube au paiement, et tout a été géré rapidement. Support réactif aussi.',
    },
    date: '1 week ago',
    verified: true,
  },
  {
    id: 3,
    name: 'Emma L.',
    username: '@emmalooks',
    avatar: 'EL',
    rating: 5,
    platform: 'youtube',
    views: '+100k',
    text: {
      en: 'The custom slider is awesome. I set my own view count, saw the price instantly, and checked out. Clean and easy.',
      fr: 'Le curseur custom est top. J\'ai choisi mon nombre de vues, vu le prix instantanément, puis payé. Simple et efficace.',
    },
    date: '3 days ago',
    verified: true,
  },
  {
    id: 4,
    name: 'David K.',
    username: '@davidkphoto',
    avatar: 'DK',
    rating: 5,
    platform: 'youtube',
    views: '+10k',
    text: {
      en: 'Clear pricing, no account access needed, and I got confirmation right away. Exactly what I wanted for YouTube visibility.',
      fr: 'Tarifs clairs, pas d\'accès au compte requis, et confirmation immédiate. Exactement ce que je voulais pour la visibilité YouTube.',
    },
    date: '5 days ago',
    verified: true,
  },
  {
    id: 5,
    name: 'Lisa T.',
    username: '@lisatravels',
    avatar: 'LT',
    rating: 5,
    platform: 'youtube',
    views: '+30k',
    text: {
      en: 'Great pacing and the dashboard pricing is transparent. My video gained traction and the overall flow feels premium.',
      fr: 'Bon pacing et tarifs transparents. Ma vidéo a gagné en traction et l\'expérience globale est premium.',
    },
    date: '1 week ago',
    verified: true,
  },
  {
    id: 6,
    name: 'Alex R.',
    username: '@alexrmusic',
    avatar: 'AR',
    rating: 5,
    platform: 'youtube',
    views: '+75k',
    text: {
      en: 'My music video got a solid visibility boost. The results came in progressively and looked normal in analytics.',
      fr: 'Mon clip a eu un bon boost de visibilité. Les résultats sont arrivés progressivement et ça reste naturel dans les stats.',
    },
    date: '4 days ago',
    verified: true,
  },
  {
    id: 7,
    name: 'Nina P.',
    username: '@ninabeauty',
    avatar: 'NP',
    rating: 5,
    platform: 'youtube',
    views: '+40k',
    text: {
      en: 'No weird steps: just choose the package and paste the video link. Clean UI and secure payment.',
      fr: 'Pas d\'étapes bizarres : tu choisis un pack et tu colles le lien de la vidéo. UI propre et paiement sécurisé.',
    },
    date: '6 days ago',
    verified: true,
  },
  {
    id: 8,
    name: 'Tom H.',
    username: '@tomhcooks',
    avatar: 'TH',
    rating: 5,
    platform: 'youtube',
    views: '+20k',
    text: {
      en: 'Fast support, clear pricing, and the campaign launched quickly. I\'ll use it again for future uploads.',
      fr: 'Support rapide, prix clairs, et campagne lancée rapidement. Je réutiliserai pour mes prochaines vidéos.',
    },
    date: '1 week ago',
    verified: true,
  },
];

export default function ReviewsSection({ lang, platform = 'all' }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const filteredReviews = platform === 'all' 
    ? reviews 
    : reviews.filter(r => r.platform === platform);

  const content = {
    en: {
      title: 'Trusted for YouTube Promotion',
      subtitle: 'Real feedback from customers using ViewPlex to run YouTube ad campaigns.',
      verified: 'Verified Purchase',
      views: 'campaign reach',
    },
    fr: {
      title: 'Approuvé pour la promotion YouTube',
      subtitle: 'Retours de clients qui utilisent ViewPlex pour lancer des campagnes publicitaires YouTube.',
      verified: 'Achat Vérifié',
      views: 'portée campagne',
    },
  };

  const t = content[lang];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredReviews.length]);

  const nextReview = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
  };

  const prevReview = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + filteredReviews.length) % filteredReviews.length);
  };

  // Get visible reviews (3 on desktop, 1 on mobile)
  const getVisibleReviews = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % filteredReviews.length;
      visible.push(filteredReviews[index]);
    }
    return visible;
  };

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_10%,rgba(239,68,68,0.08),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            {t.subtitle}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                4.9/5
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Average rating' : 'Note moyenne'}</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                50K+
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Orders processed' : 'Commandes traitées'}</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                10M+
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Campaigns launched' : 'Campagnes lancées'}</div>
            </div>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white border border-gray-200 flex items-center justify-center text-gray-900 transition-all hover:scale-110 hidden lg:flex dark:bg-gray-900/80 dark:hover:bg-gray-900 dark:border-gray-800 dark:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white border border-gray-200 flex items-center justify-center text-gray-900 transition-all hover:scale-110 hidden lg:flex dark:bg-gray-900/80 dark:hover:bg-gray-900 dark:border-gray-800 dark:text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleReviews().map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className={`relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 dark:bg-gray-950 dark:border-gray-800 ${
                  index === 1 ? 'lg:scale-105 lg:z-10' : ''
                }`}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-red-600/10">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br from-red-600 to-red-500">
                    {review.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{review.name}</h4>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">
                          ✓ {t.verified}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{review.username}</p>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 leading-relaxed mb-4 dark:text-gray-300">
                  &ldquo;{review.text[lang]}&rdquo;
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.122C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.519A2.999 2.999 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 0 0 2.112 2.122c1.881.519 9.386.519 9.386.519s7.505 0 9.386-.519a2.999 2.999 0 0 0 2.112-2.122C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </span>
                    <span className="text-sm text-green-600 font-medium dark:text-green-400">
                      {review.views} {t.views}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8 lg:hidden">
            <button
              onClick={prevReview}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 transition-colors dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-800 dark:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {filteredReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-red-600'
                      : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextReview}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 transition-colors dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-800 dark:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{lang === 'en' ? 'Verified Reviews' : 'Avis Vérifiés'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{lang === 'en' ? 'Secure Payments' : 'Paiements Sécurisés'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">{lang === 'en' ? '5-Star Service' : 'Service 5 Étoiles'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
