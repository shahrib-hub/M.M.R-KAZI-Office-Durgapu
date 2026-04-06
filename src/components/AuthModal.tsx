import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-sm shadow-2xl overflow-hidden border-2 border-secondary/30 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-primary p-10 text-center relative islamic-pattern">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20 bg-primary/50 p-1 rounded-full backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="mb-4 max-w-[140px] mx-auto relative z-10">
                <img 
                  src="https://i.ibb.co/KjJSFyzK/Airbrush-BG-CHANGER-1775314610814.png" 
                  alt="Muhammadan Marriage And Divorce Registrar & Kazi" 
                  className="w-full h-auto drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-emerald-100 text-sm italic font-serif relative z-10">
                {t('auth.loginDesc')}
              </p>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 bg-ambient dark:bg-slate-900">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-sm font-serif italic">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="w-full pl-10 pr-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button type="button" className="text-xs text-secondary font-bold hover:underline uppercase tracking-tighter">{t('auth.forgot')}</button>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-sm font-serif text-lg hover:bg-emerald-900 transition-all shadow-lg flex items-center justify-center gap-3 group border-2 border-secondary/20 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : t('auth.loginBtn')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 italic font-serif">
                  Registration is currently restricted to administrators.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

