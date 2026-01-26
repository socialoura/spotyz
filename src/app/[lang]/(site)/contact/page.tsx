'use client';

import { useState } from 'react';
import { Language } from '@/i18n/config';
import ChatWidget from '@/components/ChatWidget';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';

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
      title: 'Contact Us',
      subtitle: 'Have a question or need help? We\'re here for you.',
      form: {
        name: 'Your Name',
        namePlaceholder: 'John Doe',
        email: 'Email Address',
        emailPlaceholder: 'john@example.com',
        subject: 'Subject',
        subjectPlaceholder: 'How can we help you?',
        message: 'Message',
        messagePlaceholder: 'Tell us more about your inquiry...',
        submit: 'Send Message',
        submitting: 'Sending...',
      },
      contactInfo: {
        title: 'Get In Touch',
        description: 'Reach out to us through any of these channels',
        email: {
          label: 'Email',
          value: 'support@socialoura.com',
        },
        phone: {
          label: 'Phone',
          value: '+33 1 84 80 00 00',
        },
        address: {
          label: 'Address',
          value: '128 Rue La Boétie, 75008 Paris, France',
        },
      },
      responseTime: {
        title: 'Quick Response',
        description: 'We typically respond within 24 hours',
      },
      support: {
        title: '24/7 Support',
        description: 'Our team is always available to help',
      },
      success: 'Message sent successfully! We\'ll get back to you soon.',
      error: 'Failed to send message. Please try again.',
    },
    fr: {
      title: 'Nous Contacter',
      subtitle: 'Une question ou besoin d\'aide ? Nous sommes là pour vous.',
      form: {
        name: 'Votre Nom',
        namePlaceholder: 'Jean Dupont',
        email: 'Adresse Email',
        emailPlaceholder: 'jean@exemple.com',
        subject: 'Sujet',
        subjectPlaceholder: 'Comment pouvons-nous vous aider ?',
        message: 'Message',
        messagePlaceholder: 'Parlez-nous de votre demande...',
        submit: 'Envoyer le Message',
        submitting: 'Envoi en cours...',
      },
      contactInfo: {
        title: 'Entrer en Contact',
        description: 'Contactez-nous via l\'un de ces canaux',
        email: {
          label: 'Email',
          value: 'support@socialoura.com',
        },
        phone: {
          label: 'Téléphone',
          value: '+33 1 84 80 00 00',
        },
        address: {
          label: 'Adresse',
          value: '128 Rue La Boétie, 75008 Paris, France',
        },
      },
      responseTime: {
        title: 'Réponse Rapide',
        description: 'Nous répondons généralement sous 24 heures',
      },
      support: {
        title: 'Support 24/7',
        description: 'Notre équipe est toujours disponible pour vous aider',
      },
      success: 'Message envoyé avec succès ! Nous vous répondrons bientôt.',
      error: 'Échec de l\'envoi du message. Veuillez réessayer.',
    },
  };

  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would normally send the form data to your backend
    console.log('Form submitted:', formData);
    
    setSubmitStatus('success');
    setIsSubmitting(false);
    
    // Reset form after successful submission
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitStatus('idle');
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t.contactInfo.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.contactInfo.description}
                </p>
                
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.contactInfo.email.label}
                      </div>
                      <a href={`mailto:${t.contactInfo.email.value}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {t.contactInfo.email.value}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.contactInfo.phone.label}
                      </div>
                      <a href={`tel:${t.contactInfo.phone.value}`} className="text-green-600 dark:text-green-400 hover:underline">
                        {t.contactInfo.phone.value}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t.responseTime.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.responseTime.description}
                </p>
              </div>

              {/* 24/7 Support Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🛟</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
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
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 Socialoura. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  );
}
