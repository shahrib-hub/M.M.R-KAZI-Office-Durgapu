import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

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
                {isLogin 
                  ? 'Access your official registration records' 
                  : 'Register for official marriage & divorce services'}
              </p>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 bg-ambient dark:bg-slate-900">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                      <input 
                        type="text" 
                        placeholder="Enter full name"
                        className="w-full pl-10 pr-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                      <input 
                        type="tel" 
                        placeholder="+91 00000 00000"
                        className="w-full pl-10 pr-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-secondary font-bold hover:underline uppercase tracking-tighter">Forgot password?</button>
                  </div>
                )}

                <button className="w-full bg-primary text-white py-4 rounded-sm font-serif text-lg hover:bg-emerald-900 transition-all shadow-lg flex items-center justify-center gap-3 group border-2 border-secondary/20">
                  {isLogin ? 'Login' : 'Register'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 italic font-serif">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-secondary font-bold hover:underline"
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
