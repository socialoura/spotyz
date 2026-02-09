'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FollowerGoal {
  followers: number;
  price: number;
  originalPrice: number;
  discount: number;
  popular?: boolean;
}

interface GoalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoal: (goal: FollowerGoal, email: string) => void;
  username: string;
  platform: 'spotify' | 'instagram' | 'tiktok';
  language?: 'en' | 'fr';
}

export default function GoalSelectionModal({
  isOpen,
  onClose,
  onSelectGoal,
  username,
  platform,
  language = 'en',
}: GoalSelectionModalProps) {
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FollowerGoal | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [goals, setGoals] = useState<FollowerGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomSlider, setShowCustomSlider] = useState(false);
  const [customFollowers, setCustomFollowers] = useState(100);

  const getUnitLabel = () => {
    if (platform === 'spotify') {
      return language === 'fr' ? 'streams' : 'streams';
    }
    return language === 'fr' ? 'streams' : 'streams';
  };

  const isSpotify = platform === 'spotify';
  const accentBorder = isSpotify ? 'border-emerald-200' : 'border-gray-200';
  const accentBtn = isSpotify
    ? 'bg-[#1DB954] hover:bg-emerald-600 shadow-emerald-600/10'
    : 'bg-gray-900 hover:bg-gray-800 shadow-gray-900/10';
  const accentRing = isSpotify ? 'focus:ring-emerald-500' : 'focus:ring-gray-900';

  const text = {
    en: {
      title: 'Choose your visibility package',
      emailLabel: 'Email address',
      emailPlaceholder: 'your@email.com',
      continue: 'Continue',
      disclaimer: '**Spotyz is fully aligned with the terms of service of Spotify. Our approach is based on authentic marketing strategies and professional partnerships.**',
      disclaimerPart2: 'We enhance your music\'s visibility by sharing your tracks through our global partner network, including real listeners, playlist curators, influencer groups, and niche communities. The package you select defines the level of exposure delivered through these partnerships.',
      disclaimerPart3: '**Disclaimer:** Results depend on your content quality, niche relevance, and consistency. While Spotyz provides exposure tools, we do not promise specific performance metrics.',
      mostPopular: 'Most popular',
      custom: 'Custom',
      customFollowers: 'Custom package',
      selectCustomAmount: 'Select your desired exposure level',
    },
    fr: {
      title: 'Choisissez votre forfait de visibilité',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'votre@email.com',
      continue: 'Continuer',
      disclaimer: '**Spotyz est entièrement conforme aux conditions d\'utilisation de Spotify. Notre approche est basée sur des stratégies marketing authentiques et des partenariats professionnels.**',
      disclaimerPart2: '**Nous améliorons la visibilité de votre profil en partageant votre contenu à travers notre réseau mondial de partenaires, incluant de vrais créateurs, des plateformes mobiles, des groupes d\'influenceurs et des communautés de niche. Le forfait que vous sélectionnez définit le niveau d\'exposition fourni par ces partenariats.**',
      disclaimerPart3: '**Avertissement :** Les résultats de visibilité dépendent de la qualité de votre contenu, de la pertinence de votre niche et de votre régularité. Bien que Spotyz fournisse des outils d\'exposition, nous ne promettons pas de mesures de performance spécifiques.',
      mostPopular: 'Plus populaire',
      custom: 'Personnalisé',
      customFollowers: 'Forfait personnalisé',
      selectCustomAmount: 'Sélectionnez votre niveau d\'exposition souhaité',
    },
  };

  const t = text[language];

  // Calculate custom price based on followers using real pricing data
  const calculateCustomPrice = (followers: number): number => {
    // Price points based on actual pricing (Instagram)
    const pricePoints = [
      { followers: 1000, price: 4.90 },
      { followers: 2500, price: 9.90 },
      { followers: 5000, price: 17.90 },
      { followers: 10000, price: 29.90 },
      { followers: 25000, price: 59.90 },
      { followers: 50000, price: 99.90 },
    ];

    // Find the two price points to interpolate between
    for (let i = 0; i < pricePoints.length - 1; i++) {
      const lower = pricePoints[i];
      const upper = pricePoints[i + 1];
      
      if (followers >= lower.followers && followers <= upper.followers) {
        // Linear interpolation between the two points
        const ratio = (followers - lower.followers) / (upper.followers - lower.followers);
        const price = lower.price + ratio * (upper.price - lower.price);
        return parseFloat(price.toFixed(2));
      }
    }
    
    // If above max, use last price point
    return pricePoints[pricePoints.length - 1].price;
  };

  // Fetch pricing from API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/admin/pricing');
        if (response.ok) {
          const data = await response.json();
          const platformGoals = data[platform] || data.youtube || data.instagram || [];
          
          // Convert API data to FollowerGoal format
          const formattedGoals: FollowerGoal[] = platformGoals.map((goal: { followers: string; price: string }, index: number) => {
            const followers = parseInt(goal.followers);
            const price = parseFloat(goal.price);
            // Calculate discount based on position (higher = more discount)
            const discountPercentage = 50 + (index * 5);
            const originalPrice = price / (1 - discountPercentage / 100);
            
            return {
              followers,
              price,
              originalPrice: parseFloat(originalPrice.toFixed(2)),
              discount: discountPercentage,
              popular: index === 3, // Make 1000 followers option popular
            };
          });
          
          setGoals(formattedGoals);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
        // Keep default empty state if API fails
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPricing();
    }
  }, [isOpen, platform]);

  // Handle animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setSelectedGoal(null);
        setEmail('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGoalSelect = (goal: FollowerGoal) => {
    setSelectedGoal(goal);
    if (goal.followers === 0) {
      setShowCustomSlider(true);
      // Set initial custom goal
      const price = calculateCustomPrice(customFollowers);
      setSelectedGoal({
        followers: customFollowers,
        price,
        originalPrice: price * 2,
        discount: 50,
      });
    } else {
      setShowCustomSlider(false);
    }
  };

  const handleCustomFollowersChange = (value: number) => {
    setCustomFollowers(value);
    const price = calculateCustomPrice(value);
    setSelectedGoal({
      followers: value,
      price,
      originalPrice: price * 2,
      discount: 50,
    });
  };

  const handleContinue = () => {
    if (selectedGoal && email) {
      onSelectGoal(selectedGoal, email);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl shadow-black/10 transition-all duration-300 ease-out w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:bg-gray-950 dark:border-gray-800 ${
            isAnimating
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all z-10 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative p-8">
            {/* Header with username badge */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-3 px-5 py-3 border ${accentBorder} rounded-2xl mb-6 bg-white`}>
                <div className={`w-12 h-12 rounded-xl ${isSpotify ? 'bg-[#1DB954]' : 'bg-gray-900'} flex items-center justify-center shadow-sm`}>
                  <span className="text-white text-xl font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase tracking-wider dark:text-gray-400">{platform === 'spotify' ? 'Track' : 'Account'}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{platform === 'spotify' ? username : `@${username}`}</div>
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                {t.title}
              </h2>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                {language === 'fr' ? 'Sélectionnez le forfait qui vous convient' : 'Select the package that suits you'}
              </p>
            </div>

            {/* Goals Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Loading...</span>
                </div>
              </div>
            ) : goals.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">No pricing options available</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {goals.map((goal) => (
                <button
                  key={goal.followers}
                  onClick={() => handleGoalSelect(goal)}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 group ${
                    selectedGoal?.followers === goal.followers
                      ? (isSpotify ? 'border-[#1DB954] bg-emerald-50 shadow-sm scale-[1.01]' : 'border-gray-900 bg-gray-50 shadow-sm scale-[1.01]')
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900'
                  }`}
                >
                  {goal.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#1DB954] text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-wider shadow-sm">
                        {t.mostPopular}
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold mb-2">
                      <span>-{goal.discount}%</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white mb-1 transition-colors">
                      +{goal.followers.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider -mt-1 mb-2 dark:text-gray-400">
                      {getUnitLabel()}
                    </div>
                    <div className={`text-xl font-black ${isSpotify ? 'text-[#1DB954]' : 'text-gray-900'}`}>
                      {language === 'fr' ? `${goal.price.toFixed(2)}€` : `$${goal.price.toFixed(2)}`}
                    </div>
                    <div className="text-xs text-gray-400 line-through">
                      {language === 'fr' ? `${goal.originalPrice.toFixed(1)}€` : `$${goal.originalPrice.toFixed(1)}`}
                    </div>
                  </div>
                  {/* Selection indicator */}
                  {selectedGoal?.followers === goal.followers && (
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${isSpotify ? 'bg-[#1DB954]' : 'bg-gray-900'} flex items-center justify-center`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              
              {/* Custom option - Full width */}
              <button
                onClick={() => handleGoalSelect({ followers: 0, price: 0, originalPrice: 0, discount: 50 })}
                className={`relative p-4 rounded-2xl border transition-all duration-300 col-span-2 sm:col-span-4 group ${
                  showCustomSlider
                    ? (isSpotify ? 'border-[#1DB954] bg-emerald-50' : 'border-gray-900 bg-gray-50')
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${isSpotify ? 'bg-[#1DB954]' : 'bg-gray-900'} flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="text-lg font-black text-gray-900 transition-colors dark:text-white">
                    {t.custom}
                  </span>
                </div>
              </button>
            </div>
            )}

            {/* Custom Slider */}
            {showCustomSlider && (
              <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      {customFollowers.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{getUnitLabel()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#1DB954]">
                      {language === 'fr' ? `${calculateCustomPrice(customFollowers)}€` : `$${calculateCustomPrice(customFollowers)}`}
                    </div>
                  </div>
                </div>
                
                <input
                  type="range"
                  min="100"
                  max="50000"
                  step="50"
                  value={customFollowers}
                  onChange={(e) => handleCustomFollowersChange(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer slider bg-gray-200 dark:bg-gray-800"
                  style={{
                    background: `linear-gradient(to right, rgb(29 185 84) 0%, rgb(29 185 84) ${((customFollowers - 100) / (50000 - 100)) * 100}%, rgb(229 231 235) ${((customFollowers - 100) / (50000 - 100)) * 100}%, rgb(229 231 235) 100%)`
                  }}
                />
                
                <div className="flex justify-between text-xs text-gray-500 mt-3 dark:text-gray-400">
                  <span>100</span>
                  <span>12.5K</span>
                  <span>25K</span>
                  <span>37.5K</span>
                  <span>50K</span>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ${accentRing} focus:border-transparent text-gray-900 placeholder-gray-400 transition-all dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:placeholder-gray-500`}
              />
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedGoal || !email}
              className={`w-full relative overflow-hidden ${accentBtn} disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:shadow-none group dark:disabled:bg-gray-800`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t.continue}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            {/* Disclaimer - Collapsible */}
            <details className="mt-6 group">
              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2 dark:text-gray-400 dark:hover:text-white">
                <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {language === 'fr' ? 'Informations légales' : 'Legal information'}
              </summary>
              <div className="mt-3 text-xs text-gray-600 space-y-2 pl-6 dark:text-gray-400">
                <p dangerouslySetInnerHTML={{ __html: t.disclaimer.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>') }} />
                <p dangerouslySetInnerHTML={{ __html: t.disclaimerPart2.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>') }} />
                <p dangerouslySetInnerHTML={{ __html: t.disclaimerPart3.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>') }} />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
