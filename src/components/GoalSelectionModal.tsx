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
  platform: 'instagram' | 'tiktok';
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

  const text = {
    en: {
      title: 'Choose a follower goal',
      emailLabel: 'Email address',
      emailPlaceholder: 'your@email.com',
      continue: 'Continue',
      disclaimer: `**Socialoura is fully aligned with the terms of service of ${platform === 'instagram' ? 'Instagram' : 'TikTok'} and Google Ads. Our approach avoids automation, fake engagement, and any unauthorized access to user accounts.**`,
      disclaimerPart2: 'We enhance your profile\'s visibility by sharing your content manually across a global partner network, including real creators, mobile platforms, influencer groups, and niche communities. The volume you select defines the level of exposure delivered through these partnerships.',
      disclaimerPart3: '**Disclaimer:** Visibility results depend on your content quality, niche relevance, and consistency. While Socialoura provides exposure tools, we do not promise specific performance metrics such as follower count or engagement levels.',
      mostPopular: 'Most popular',
      custom: 'Custom',
      customFollowers: 'Custom followers',
      selectCustomAmount: 'Select your desired follower count',
    },
    fr: {
      title: 'Choisissez un objectif d\'abonnés',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'votre@email.com',
      continue: 'Continuer',
      disclaimer: `**Socialoura est entièrement conforme aux conditions d'utilisation de ${platform === 'instagram' ? 'Instagram' : 'TikTok'} et Google Ads. Notre approche évite l'automatisation, l'engagement factice et tout accès non autorisé aux comptes d'utilisateurs.**`,
      disclaimerPart2: '**Nous améliorons la visibilité de votre profil en partageant votre contenu manuellement à travers un réseau mondial de partenaires, incluant de vrais créateurs, des plateformes mobiles, des groupes d\'influenceurs et des communautés de niche. Le volume que vous sélectionnez définit le niveau d\'exposition fourni par ces partenariats.**',
      disclaimerPart3: '**Avertissement :** Les résultats de visibilité dépendent de la qualité de votre contenu, de la pertinence de votre niche et de votre régularité. Bien que Socialoura fournisse des outils d\'exposition, nous ne promettons pas de mesures de performance spécifiques telles que le nombre d\'abonnés ou les niveaux d\'engagement.',
      mostPopular: 'Plus populaire',
      custom: 'Personnalisé',
      customFollowers: 'Abonnés personnalisés',
      selectCustomAmount: 'Sélectionnez le nombre d\'abonnés souhaité',
    },
  };

  const t = text[language];

  // Calculate custom price based on followers using real pricing data
  const calculateCustomPrice = (followers: number): number => {
    // Price points based on actual pricing (Instagram)
    const pricePoints = platform === 'instagram' 
      ? [
          { followers: 100, price: 1.90 },
          { followers: 250, price: 3.90 },
          { followers: 500, price: 5.90 },
          { followers: 1000, price: 9.90 },
          { followers: 2500, price: 19.90 },
          { followers: 5000, price: 34.90 },
          { followers: 10000, price: 59.90 },
          { followers: 25000, price: 80.00 },
          { followers: 50000, price: 150.00 },
        ]
      : [
          { followers: 100, price: 2.90 },
          { followers: 250, price: 5.90 },
          { followers: 500, price: 8.90 },
          { followers: 1000, price: 14.90 },
          { followers: 2500, price: 29.90 },
          { followers: 5000, price: 49.90 },
          { followers: 10000, price: 89.90 },
          { followers: 25000, price: 120.00 },
          { followers: 50000, price: 200.00 },
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
          const platformGoals = platform === 'instagram' ? data.instagram : data.tiktok;
          
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
              popular: index === 1, // Make second option popular
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all duration-300 ease-out w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            isAnimating
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t.title}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-700 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  @{username}
                </span>
              </div>
            </div>

            {/* Goals Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600 dark:text-gray-400">Loading pricing options...</div>
              </div>
            ) : goals.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600 dark:text-gray-400">No pricing options available</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {goals.map((goal) => (
                <button
                  key={goal.followers}
                  onClick={() => handleGoalSelect(goal)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedGoal?.followers === goal.followers
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {goal.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {t.mostPopular}
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      -{goal.discount}%
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      +{goal.followers.toLocaleString()}
                    </div>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {language === 'fr' ? `${goal.price.toFixed(2)}€` : `$${goal.price.toFixed(2)}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                      {language === 'fr' ? `${goal.originalPrice.toFixed(1)}€` : `$${goal.originalPrice.toFixed(1)}`}
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Custom option - Full width */}
              <button
                onClick={() => handleGoalSelect({ followers: 0, price: 0, originalPrice: 0, discount: 50 })}
                className={`relative p-4 rounded-lg border-2 transition-all col-span-2 sm:col-span-4 ${
                  showCustomSlider
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {t.custom}
                  </div>
                </div>
              </button>
            </div>
            )}

            {/* Custom Slider */}
            {showCustomSlider && (
              <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.customFollowers}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t.selectCustomAmount}
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {customFollowers.toLocaleString()} followers
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {language === 'fr' ? `€${calculateCustomPrice(customFollowers)}` : `$${calculateCustomPrice(customFollowers)}`}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="100"
                    max="50000"
                    step="50"
                    value={customFollowers}
                    onChange={(e) => handleCustomFollowersChange(parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${((customFollowers - 100) / (50000 - 100)) * 100}%, ${
                        typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                          ? 'rgb(55 65 81)'
                          : 'rgb(229 231 235)'
                      } ${((customFollowers - 100) / (50000 - 100)) * 100}%, ${
                        typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                          ? 'rgb(55 65 81)'
                          : 'rgb(229 231 235)'
                      } 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>100</span>
                    <span>5,000</span>
                    <span>25,000</span>
                    <span>50,000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            {/* Disclaimer */}
            <div className="mb-6 text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <p dangerouslySetInnerHTML={{ __html: t.disclaimer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              <p dangerouslySetInnerHTML={{ __html: t.disclaimerPart2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              <p dangerouslySetInnerHTML={{ __html: t.disclaimerPart3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedGoal || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {t.continue}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
