'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Language } from '@/i18n/config';

interface ChatWidgetProps {
  lang: Language;
}

export default function ChatWidget({ lang }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'support'; timestamp: Date }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const content = {
    en: {
      title: 'Chat with us',
      subtitle: 'We\'re here to help!',
      placeholder: 'Type your message...',
      send: 'Send',
      online: 'Online',
      typingIndicator: 'Support is typing...',
      initialMessage: 'Hi! How can we help you today? Leave your message and email, we\'ll get back to you shortly.',
      closeChat: 'Close chat',
      minimizeChat: 'Minimize chat',
      emailPlaceholder: 'Your email (required)',
      emailRequired: 'Please enter your email address first.',
      emailInvalid: 'Please enter a valid email address.',
      messageSent: 'Message sent! We\'ll reply to your email soon.',
      messageError: 'Error sending message. Please try again.',
    },
    fr: {
      title: 'Discutez avec nous',
      subtitle: 'Nous sommes là pour vous aider !',
      placeholder: 'Tapez votre message...',
      send: 'Envoyer',
      online: 'En ligne',
      typingIndicator: 'Le support écrit...',
      initialMessage: 'Bonjour ! Comment pouvons-nous vous aider ? Laissez votre message et email, nous vous répondrons rapidement.',
      closeChat: 'Fermer le chat',
      minimizeChat: 'Minimiser le chat',
      emailPlaceholder: 'Votre email (obligatoire)',
      emailRequired: 'Veuillez entrer votre adresse email.',
      emailInvalid: 'Veuillez entrer une adresse email valide.',
      messageSent: 'Message envoyé ! Nous répondrons à votre email bientôt.',
      messageError: 'Erreur lors de l\'envoi. Veuillez réessayer.',
    },
  };

  const t = content[lang];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial support message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            text: t.initialMessage,
            sender: 'support',
            timestamp: new Date(),
          },
        ]);
      }, 500);
    }
  }, [isOpen, messages.length, t.initialMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(t.emailRequired);
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError(t.emailInvalid);
      return;
    }
    setEmailError('');

    const userMessage = message;
    const userEmail = email;

    // Add user message to chat
    const newMessage = {
      text: userMessage,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsSending(true);

    try {
      // Send message to support via API
      const response = await fetch('/api/support-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          email: userEmail,
          language: lang,
        }),
      });

      if (response.ok) {
        // Show confirmation message
        setMessages(prev => [
          ...prev,
          {
            text: t.messageSent,
            sender: 'support',
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      // Show error message
      setMessages(prev => [
        ...prev,
        {
          text: t.messageError,
          sender: 'support',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-[#1DB954] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
          
          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {t.title}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden
            inset-4 rounded-2xl w-auto max-w-none
            sm:inset-auto sm:bottom-6 sm:right-6 sm:rounded-2xl sm:w-[400px] sm:max-w-[calc(100vw-3rem)]
            ${isMinimized ? 'h-16 sm:h-16' : 'h-[calc(100vh-2rem)] sm:h-[600px]'}
          `}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#1DB954] to-emerald-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-[#1DB954]" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="text-white">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-400 rounded-full"></span>
                  {t.online}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={minimizeChat}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                aria-label={t.minimizeChat}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                aria-label={t.closeChat}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#1DB954] to-emerald-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder={t.emailPlaceholder}
                    required
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 transition-colors text-sm ${emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || !email.trim() || isSending}
                    className="bg-gradient-to-r from-[#1DB954] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-all hover:scale-105 disabled:hover:scale-100"
                    aria-label={t.send}
                  >
                    {isSending ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
