'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/i18n/config';

interface ReviewsSectionProps {
  lang: Language;
  platform?: 'spotify' | 'all';
}

interface Review {
  id: number;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  platform: 'spotify';
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
    platform: 'spotify',
    views: '+25k',
    text: {
      en: 'Super smooth checkout and the campaign started fast. My track picked up more streams and the pacing looked natural. Great experience.',
      fr: 'Paiement super simple et la campagne a démarré rapidement. Mon titre a gagné plus de streams avec un rythme naturel. Très bonne expérience.',
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
    platform: 'spotify',
    views: '+50k',
    text: {
      en: 'Perfect for a new upload. I chose a package, added my Spotify link at checkout, and everything was handled quickly. Support was responsive too.',
      fr: 'Parfait pour une nouvelle vidéo. J\'ai choisi un pack, ajouté mon lien Spotify au paiement, et tout a été géré rapidement. Support réactif aussi.',
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
    platform: 'spotify',
    views: '+100k',
    text: {
      en: 'The custom slider is awesome. I set my own stream count, saw the price instantly, and checked out. Clean and easy.',
      fr: 'Le curseur custom est top. J\'ai choisi mon nombre de streams, vu le prix instantanément, puis payé. Simple et efficace.',
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
    platform: 'spotify',
    views: '+10k',
    text: {
      en: 'Clear pricing, no account access needed, and I got confirmation right away. Exactly what I wanted for Spotify visibility.',
      fr: 'Tarifs clairs, pas d\'accès au compte requis, et confirmation immédiate. Exactement ce que je voulais pour la visibilité Spotify.',
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
    platform: 'spotify',
    views: '+30k',
    text: {
      en: 'Great pacing and the dashboard pricing is transparent. My track gained traction and the overall flow feels premium.',
      fr: 'Bon pacing et tarifs transparents. Mon titre a gagné en traction et l\'expérience globale est premium.',
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
    platform: 'spotify',
    views: '+75k',
    text: {
      en: 'My track got a solid visibility boost. The results came in progressively and looked normal in analytics.',
      fr: 'Mon titre a eu un bon boost de visibilité. Les résultats sont arrivés progressivement et ça reste naturel dans les stats.',
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
    platform: 'spotify',
    views: '+40k',
    text: {
      en: 'No weird steps: just choose the package and paste the track link. Clean UI and secure payment.',
      fr: 'Pas d\'étapes bizarres : tu choisis un pack et tu colles le lien du titre. UI propre et paiement sécurisé.',
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
    platform: 'spotify',
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
      title: 'Trusted for Spotify Promotion',
      subtitle: 'Real feedback from customers using Spotyz to boost their Spotify tracks.',
      verified: 'Verified Purchase',
      views: 'campaign reach',
    },
    fr: {
      title: 'Approuvé pour la promotion Spotify',
      subtitle: 'Retours de clients qui utilisent Spotyz pour booster leurs titres Spotify.',
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
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_10%,rgba(29,185,84,0.08),transparent_55%)]" />

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
                <div className="absolute top-4 right-4 text-[#1DB954]/10">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br from-[#1DB954] to-emerald-500">
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
                    <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
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
                      ? 'w-6 bg-[#1DB954]'
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
            <svg className="w-5 h-5 text-[#1DB954]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">{lang === 'en' ? '5-Star Service' : 'Service 5 Étoiles'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
