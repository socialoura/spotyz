'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import { Plus, Minus, HelpCircle, Mail, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';

interface PageProps {
  params: { lang: string };
}

export default function FAQPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'general' | 'orders' | 'payment' | 'support' | 'all'>('all');

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const content = {
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Clear answers about setup, delivery pacing, and secure checkout.',
      categories: {
        general: 'General',
        orders: 'Orders & Delivery',
        payment: 'Payment & Security',
        support: 'Support',
      },
      faqs: [
        {
          category: 'general',
          question: 'What is Spotyz?',
          answer: 'Spotyz helps you run a visibility campaign for your Spotify track with a simple setup and secure checkout. We focus on discovery and reach, not artificial engagement.',
        },
        {
          category: 'general',
          question: 'Is it safe to use your services?',
          answer: 'We use a marketing-first approach focused on visibility and discovery. We never ask for your password and you keep full control of your account.',
        },
        {
          category: 'general',
          question: 'Do you need access to my account?',
          answer: 'No. For Spotify visibility campaigns, we only require your public track link. No login or private account access is requested.',
        },
        {
          category: 'orders',
          question: 'How long does delivery take?',
          answer: 'Most campaigns start within 0-24 hours after confirmation. Delivery is progressive to keep a natural pacing and avoid sudden spikes.',
        },
        {
          category: 'orders',
          question: 'Do I need to provide my password?',
          answer: 'No, never. We only need your public Spotify track link and a contact email for the receipt and follow-up.',
        },
        {
          category: 'orders',
          question: 'What if I don\'t receive my order?',
          answer: 'If anything looks off, contact support with your payment ID. We\'ll investigate and help resolve the issue as quickly as possible.',
        },
        {
          category: 'orders',
          question: 'Can I run campaigns for multiple tracks?',
          answer: 'Yes. Submit one order per track link so each campaign can be tracked independently.',
        },
        {
          category: 'payment',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay through our secure credit card checkout.',
        },
        {
          category: 'payment',
          question: 'Is my payment information secure?',
          answer: 'Yes, 100%. Payments are processed through a PCI-compliant provider. Your payment details are encrypted and never stored on our servers.',
        },
        {
          category: 'payment',
          question: 'Do you offer refunds?',
          answer: 'If there is a verified delivery issue, contact support and we\'ll review your case quickly. Please include your payment ID.',
        },
        {
          category: 'support',
          question: 'How can I contact support?',
          answer: 'Use the chat widget on the site or email support@spotyz.com. We typically respond within 24 hours.',
        },
        {
          category: 'support',
          question: 'What are your support hours?',
          answer: 'We aim to answer within 24 hours. For urgent questions, the chat widget is usually the fastest way to reach us.',
        },
      ],
      contactTitle: 'Still have questions?',
      contactSubtitle: 'Our support team is here to help you',
      contactChat: 'Chat with us',
      contactEmail: 'Email us',
      responseTime: 'We respond within 24 hours',
    },
    fr: {
      title: 'Questions Fréquemment Posées',
      subtitle: 'Réponses claires sur la mise en place, la livraison progressive et le paiement sécurisé.',
      categories: {
        general: 'Général',
        orders: 'Commandes & Livraison',
        payment: 'Paiement & Sécurité',
        support: 'Support',
      },
      faqs: [
        {
          category: 'general',
          question: 'Qu\'est-ce que Spotyz ?',
          answer: 'Spotyz vous aide à lancer une campagne de visibilité pour votre vidéo Spotify avec une mise en place simple et un paiement sécurisé. Nous mettons l\'accent sur la découverte et la portée.',
        },
        {
          category: 'general',
          question: 'Est-ce sûr d\'utiliser vos services ?',
          answer: 'Notre approche est marketing-first et axée sur la visibilité/découverte. Nous ne demandons jamais votre mot de passe et vous gardez le contrôle.',
        },
        {
          category: 'general',
          question: 'Avez-vous besoin d\'accéder à mon compte ?',
          answer: 'Non. Pour les campagnes Spotify, nous avons seulement besoin du lien public du titre. Aucune connexion n\'est demandée.',
        },
        {
          category: 'orders',
          question: 'Combien de temps prend la livraison ?',
          answer: 'La plupart des campagnes démarrent dans les 0-24 heures après confirmation. La livraison est progressive pour un rythme naturel.',
        },
        {
          category: 'orders',
          question: 'Dois-je fournir mon mot de passe ?',
          answer: 'Non, jamais. Nous avons besoin uniquement du lien public de votre titre et d\'un email pour le reçu et le suivi.',
        },
        {
          category: 'orders',
          question: 'Que se passe-t-il si je ne reçois pas ma commande ?',
          answer: 'Si quelque chose semble anormal, contactez le support avec votre identifiant de paiement. Nous enquêtons et vous aidons rapidement.',
        },
        {
          category: 'orders',
          question: 'Puis-je lancer des campagnes pour plusieurs titres ?',
          answer: 'Oui. Passez une commande par lien de titre afin de suivre chaque campagne séparément.',
        },
        {
          category: 'payment',
          question: 'Quels modes de paiement acceptez-vous ?',
          answer: 'Nous acceptons toutes les principales cartes bancaires (Visa, Mastercard, American Express), Apple Pay et Google Pay via notre paiement sécurisé par carte bancaire.',
        },
        {
          category: 'payment',
          question: 'Mes informations de paiement sont-elles sécurisées ?',
          answer: 'Oui, à 100%. Le paiement est traité via un prestataire conforme PCI. Vos informations de paiement sont cryptées et jamais stockées sur nos serveurs.',
        },
        {
          category: 'payment',
          question: 'Proposez-vous des remboursements ?',
          answer: 'En cas de problème de livraison vérifié, contactez le support et nous étudierons votre demande rapidement. Ajoutez l\'identifiant de paiement.',
        },
        {
          category: 'support',
          question: 'Comment puis-je contacter le support ?',
          answer: 'Via le widget de chat sur le site, ou par email à support@spotyz.com. Réponse généralement sous 24 heures.',
        },
        {
          category: 'support',
          question: 'Quelles sont vos heures de support ?',
          answer: 'Nous visons une réponse sous 24 heures. Pour les demandes urgentes, le chat est souvent le plus rapide.',
        },
      ],
      contactTitle: 'Vous avez encore des questions ?',
      contactSubtitle: 'Notre équipe de support est là pour vous aider',
      contactChat: 'Discutez avec nous',
      contactEmail: 'Envoyez-nous un email',
      responseTime: 'Nous répondons sous 24 heures',
    },
  };

  const t = content[lang];

  const categories = ['general', 'orders', 'payment', 'support'] as const;
  const filteredFaqs = activeCategory === 'all'
    ? t.faqs
    : t.faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_20%,rgba(29,185,84,0.10),transparent_55%),radial-gradient(900px_circle_at_90%_35%,rgba(29,185,84,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,6,23,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30 dark:opacity-15" />
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_55%_at_50%_35%,black,transparent)] bg-gradient-to-b from-white/0 via-white/40 to-white dark:from-gray-950/0 dark:via-gray-950/70 dark:to-gray-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:pt-16 sm:pb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1DB954] shadow-sm mb-5 sm:mb-6 border border-emerald-700/10">
            <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t.title}
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#1DB954] text-white border-[#1DB954]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800 dark:hover:bg-gray-900'
              }`}
            >
              {lang === 'fr' ? 'Tout' : 'All'}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold border transition-colors ${
                  activeCategory === category
                    ? 'bg-[#1DB954] text-white border-[#1DB954]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800 dark:hover:bg-gray-900'
                }`}
              >
                {t.categories[category]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const globalIndex = t.faqs.indexOf(faq);
              const isOpen = openIndex === globalIndex;
              const categoryLabel = t.categories[faq.category as keyof typeof t.categories];

              return (
                <div
                  key={index}
                  className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-sm transition-colors dark:bg-gray-950 dark:border-gray-800"
                >
                  <button
                    onClick={() => toggleFaq(globalIndex)}
                    className="w-full flex items-center justify-between text-left p-4 sm:p-6 hover:bg-gray-50 transition-colors dark:hover:bg-gray-900"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {categoryLabel}
                      </div>
                      <div className="mt-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </div>
                    </div>
                    <div className={`ml-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-[#1DB954] rotate-180' : 'bg-gray-100 dark:bg-gray-900'}`}>
                      {isOpen ? (
                        <Minus className="h-4 w-4 text-white" />
                      ) : (
                        <Plus className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-sm sm:text-base leading-7 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-10 sm:py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-gray-200 mb-4 dark:bg-gray-950 dark:border-gray-800">
              <ShieldCheck className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
              {t.contactTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
              {t.contactSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:support@spotyz.com`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5" />
                {t.contactEmail}
              </a>
              <a
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-emerald-600 text-white font-black rounded-xl transition-colors"
              >
                {lang === 'fr' ? 'Ouvrir la page contact' : 'Open contact page'}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t.responseTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}
