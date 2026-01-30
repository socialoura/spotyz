'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import ChatWidget from '@/components/ChatWidget';
import { Mail, MessageSquare, Phone, MapPin, Send, ShieldCheck } from 'lucide-react';

interface PageProps {
  params: { lang: string };
}

export default function ContactPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const content = {
    en: {
      title: 'Contact ViewPlex',
      subtitle: 'Questions about your campaign, billing, or setup? Our team is here to help.',
      form: {
        name: 'Your Name',
        namePlaceholder: 'John Doe',
        email: 'Email Address',
        emailPlaceholder: 'john@example.com',
        subject: 'Topic',
        subjectPlaceholder: 'Campaign question / Billing / Technical help',
        message: 'Message',
        messagePlaceholder: 'Tell us what you need and include your video link if relevant.',
        submit: 'Send message',
        submitting: 'Sending...',
      },
      contactInfo: {
        title: 'Get In Touch',
        description: 'We usually reply within 24 hours (often faster).',
        email: {
          label: 'Email',
          value: 'support@view-plex.com',
        },
        phone: {
          label: 'Phone',
          value: '+33 1 84 89 16 79',
        },
        address: {
          label: 'Address',
          value: 'Paris, France',
        },
      },
      responseTime: {
        title: 'Quick Response',
        description: 'Most requests are answered within 24 hours.',
      },
      support: {
        title: 'Safe & transparent',
        description: 'We focus on visibility and discovery. No passwords are ever required.',
      },
      success: 'Message sent! We\'ll get back to you soon.',
      error: 'Failed to send message. Please try again.',
    },
    fr: {
      title: 'Contacter ViewPlex',
      subtitle: 'Questions sur votre campagne, la facturation ou la mise en place ? Notre équipe est là pour vous.',
      form: {
        name: 'Votre Nom',
        namePlaceholder: 'Jean Dupont',
        email: 'Adresse Email',
        emailPlaceholder: 'jean@exemple.com',
        subject: 'Sujet',
        subjectPlaceholder: 'Question campagne / Facturation / Assistance technique',
        message: 'Message',
        messagePlaceholder: 'Dites-nous ce dont vous avez besoin et ajoutez le lien de la vidéo si utile.',
        submit: 'Envoyer',
        submitting: 'Envoi...',
      },
      contactInfo: {
        title: 'Entrer en Contact',
        description: 'Réponse sous 24h (souvent plus rapide).',
        email: {
          label: 'Email',
          value: 'support@view-plex.com',
        },
        phone: {
          label: 'Téléphone',
          value: '+33 1 84 80 00 00',
        },
        address: {
          label: 'Adresse',
          value: 'Paris, France',
        },
      },
      responseTime: {
        title: 'Réponse Rapide',
        description: 'La plupart des demandes reçoivent une réponse sous 24 heures.',
      },
      support: {
        title: 'Sécurité & transparence',
        description: 'Nous mettons l\'accent sur la visibilité et la découverte. Aucun mot de passe n\'est nécessaire.',
      },
      success: 'Message envoyé avec succès ! Nous vous répondrons bientôt.',
      error: 'Échec de l\'envoi du message. Veuillez réessayer.',
    },
  };

  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setSubmitStatus('idle');
      const composedMessage = [
        `Name: ${formData.name || 'N/A'}`,
        `Topic: ${formData.subject || 'N/A'}`,
        '',
        formData.message,
      ].join('\n');

      const res = await fetch('/api/support-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: composedMessage,
          email: formData.email || (lang === 'fr' ? 'Non fourni' : 'Not provided'),
          language: lang,
        }),
      });

      if (!res.ok) {
        setSubmitStatus('error');
      } else {
        setSubmitStatus('success');
        setTimeout(() => {
          setFormData({ name: '', email: '', subject: '', message: '' });
          setSubmitStatus('idle');
        }, 3000);
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="pt-8 pb-6 sm:pt-12 sm:pb-10">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-6 sm:mb-10">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
              {t.title}
            </h1>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-5 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.form.name}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t.form.namePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.form.email}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t.form.emailPlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.form.subject}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder={t.form.subjectPlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.form.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder={t.form.messagePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-black py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="h-5 w-5" />
                    {isSubmitting ? t.form.submitting : t.form.submit}
                  </button>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200">
                      {t.success}
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200">
                      {t.error}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Contact Information Sidebar */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t.contactInfo.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.contactInfo.description}
                </p>
                
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
                      <Mail className="h-5 w-5 text-red-700 dark:text-red-200" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.contactInfo.email.label}
                      </div>
                      <a href={`mailto:${t.contactInfo.email.value}`} className="text-red-600 dark:text-red-300 hover:underline">
                        {t.contactInfo.email.value}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800">
                      <Phone className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.contactInfo.phone.label}
                      </div>
                      <a href={`tel:${t.contactInfo.phone.value}`} className="text-gray-700 dark:text-gray-200 hover:underline">
                        {t.contactInfo.phone.value}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800">
                      <MapPin className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.contactInfo.address.label}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t.contactInfo.address.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-6 w-6 text-red-700 dark:text-red-200" />
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {t.responseTime.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.responseTime.description}
                </p>
              </div>

              {/* 24/7 Support Card */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="h-6 w-6 text-green-700 dark:text-green-400" />
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {t.support.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.support.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-10 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 ViewPlex. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}
