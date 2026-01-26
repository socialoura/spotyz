'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import { Plus, Minus, HelpCircle, Mail, Clock } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';

interface PageProps {
  params: { lang: string };
}

export default function FAQPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const content = {
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to the most common questions about our services',
      categories: {
        general: 'General',
        orders: 'Orders & Delivery',
        payment: 'Payment & Security',
        support: 'Support',
      },
      faqs: [
        {
          category: 'general',
          question: 'What is SocialOura?',
          answer: 'SocialOura is a professional marketing platform that helps you grow your social media presence on Instagram and TikTok through our exclusive partner network. We provide authentic engagement to expand your reach.',
        },
        {
          category: 'general',
          question: 'Is it safe to use your services?',
          answer: 'Yes, absolutely! We use safe and compliant methods that respect platform guidelines. Your account security is our top priority, and we never ask for your password.',
        },
        {
          category: 'general',
          question: 'Will my account get banned?',
          answer: 'No. We use gradual delivery methods that mimic organic growth patterns. This ensures your account remains safe and in good standing with the platform.',
        },
        {
          category: 'orders',
          question: 'How long does delivery take?',
          answer: 'Delivery typically starts within 0-24 hours after your order is confirmed. The full delivery is completed gradually over 24-72 hours to ensure natural-looking growth.',
        },
        {
          category: 'orders',
          question: 'Do I need to provide my password?',
          answer: 'No, never! We only need your public username. We will never ask for your password or any sensitive account information.',
        },
        {
          category: 'orders',
          question: 'What if I don\'t receive my order?',
          answer: 'If you experience any issues with your order, please contact our support team. We offer a full refund or redelivery guarantee if we fail to deliver your order.',
        },
        {
          category: 'orders',
          question: 'Can I order for multiple accounts?',
          answer: 'Yes! You can place separate orders for different accounts. Each order is processed independently.',
        },
        {
          category: 'payment',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay through our secure Stripe payment processor.',
        },
        {
          category: 'payment',
          question: 'Is my payment information secure?',
          answer: 'Yes, 100%. We use Stripe, a PCI-compliant payment processor. Your payment details are encrypted and never stored on our servers.',
        },
        {
          category: 'payment',
          question: 'Do you offer refunds?',
          answer: 'Yes, we offer refunds if we are unable to deliver your order. Please contact our support team within 7 days of your purchase if you have any issues.',
        },
        {
          category: 'support',
          question: 'How can I contact support?',
          answer: 'You can reach us through the chat widget on our website, or email us at support@socialoura.com. We typically respond within 24 hours.',
        },
        {
          category: 'support',
          question: 'What are your support hours?',
          answer: 'Our support team is available Monday to Friday, 9 AM to 6 PM (CET). For urgent matters, please use the chat widget for faster response.',
        },
      ],
      contactTitle: 'Still have questions?',
      contactSubtitle: 'Our support team is here to help you',
      contactChat: 'Chat with us',
      contactEmail: 'Email us',
      responseTime: 'We respond within 24 hours',
    },
    fr: {
      title: 'Questions Fréquentes',
      subtitle: 'Trouvez les réponses aux questions les plus courantes sur nos services',
      categories: {
        general: 'Général',
        orders: 'Commandes & Livraison',
        payment: 'Paiement & Sécurité',
        support: 'Support',
      },
      faqs: [
        {
          category: 'general',
          question: 'Qu\'est-ce que SocialOura ?',
          answer: 'SocialOura est une plateforme de marketing professionnelle qui vous aide à développer votre présence sur Instagram et TikTok grâce à notre réseau de partenaires exclusifs. Nous fournissons un engagement authentique pour étendre votre portée.',
        },
        {
          category: 'general',
          question: 'Est-ce sûr d\'utiliser vos services ?',
          answer: 'Oui, absolument ! Nous utilisons des méthodes sûres et conformes qui respectent les directives des plateformes. La sécurité de votre compte est notre priorité, et nous ne demandons jamais votre mot de passe.',
        },
        {
          category: 'general',
          question: 'Mon compte risque-t-il d\'être banni ?',
          answer: 'Non. Nous utilisons des méthodes de livraison progressive qui imitent les modèles de croissance organique. Cela garantit que votre compte reste en sécurité et en règle avec la plateforme.',
        },
        {
          category: 'orders',
          question: 'Combien de temps prend la livraison ?',
          answer: 'La livraison commence généralement dans les 0-24 heures après la confirmation de votre commande. La livraison complète est effectuée progressivement sur 24-72 heures pour assurer une croissance naturelle.',
        },
        {
          category: 'orders',
          question: 'Dois-je fournir mon mot de passe ?',
          answer: 'Non, jamais ! Nous avons seulement besoin de votre nom d\'utilisateur public. Nous ne demanderons jamais votre mot de passe ou toute information sensible de compte.',
        },
        {
          category: 'orders',
          question: 'Que se passe-t-il si je ne reçois pas ma commande ?',
          answer: 'Si vous rencontrez des problèmes avec votre commande, veuillez contacter notre équipe de support. Nous offrons un remboursement complet ou une nouvelle livraison si nous ne parvenons pas à livrer votre commande.',
        },
        {
          category: 'orders',
          question: 'Puis-je commander pour plusieurs comptes ?',
          answer: 'Oui ! Vous pouvez passer des commandes séparées pour différents comptes. Chaque commande est traitée indépendamment.',
        },
        {
          category: 'payment',
          question: 'Quels modes de paiement acceptez-vous ?',
          answer: 'Nous acceptons toutes les principales cartes de crédit (Visa, Mastercard, American Express), Apple Pay et Google Pay via notre processeur de paiement sécurisé Stripe.',
        },
        {
          category: 'payment',
          question: 'Mes informations de paiement sont-elles sécurisées ?',
          answer: 'Oui, à 100%. Nous utilisons Stripe, un processeur de paiement conforme PCI. Vos informations de paiement sont cryptées et jamais stockées sur nos serveurs.',
        },
        {
          category: 'payment',
          question: 'Proposez-vous des remboursements ?',
          answer: 'Oui, nous offrons des remboursements si nous ne sommes pas en mesure de livrer votre commande. Veuillez contacter notre équipe de support dans les 7 jours suivant votre achat en cas de problème.',
        },
        {
          category: 'support',
          question: 'Comment puis-je contacter le support ?',
          answer: 'Vous pouvez nous joindre via le widget de chat sur notre site, ou nous envoyer un email à support@socialoura.com. Nous répondons généralement sous 24 heures.',
        },
        {
          category: 'support',
          question: 'Quelles sont vos heures de support ?',
          answer: 'Notre équipe de support est disponible du lundi au vendredi, de 9h à 18h (CET). Pour les questions urgentes, utilisez le widget de chat pour une réponse plus rapide.',
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

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category) => {
            const categoryFaqs = t.faqs.filter((faq) => faq.category === category);
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  {t.categories[category]}
                </h2>
                <div className="space-y-4">
                  {categoryFaqs.map((faq, index) => {
                    const globalIndex = t.faqs.indexOf(faq);
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={index}
                        className={`rounded-2xl border transition-all duration-300 ${
                          isOpen
                            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left"
                        >
                          <span className={`text-lg font-medium ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                            {faq.question}
                          </span>
                          <span className={`ml-4 flex-shrink-0 p-2 rounded-full transition-colors ${
                            isOpen ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {isOpen ? (
                              <Minus className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5">
                            <p className="text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.contactTitle}
          </h2>
          <p className="text-gray-400 mb-8">
            {t.contactSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@socialoura.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              <Mail className="w-5 h-5" />
              {t.contactEmail}
            </a>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t.responseTime}</span>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}
