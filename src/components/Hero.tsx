import { motion } from 'motion/react';
import { ScrollText, Heart, ShieldCheck } from 'lucide-react';
import ImageBanner from './ImageBanner';

interface HeroProps {
  onAuthClick: () => void;
}

export default function Hero({ onAuthClick }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1519810755548-39cd217da494?q=80&w=2000" 
          alt="Islamic Architecture" 
          className="w-full h-full object-cover opacity-20 dark:opacity-10"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ambient via-ambient/80 to-ambient dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 max-w-2xl">
              <img 
                src="https://i.ibb.co/KjJSFyzK/Airbrush-BG-CHANGER-1775314610814.png" 
                alt="Muhammadan Marriage And Divorce Registrar & Kazi" 
                className="w-full h-auto drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="inline-block mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-[1px] w-12 bg-secondary" />
                <span className="text-secondary font-medium tracking-[0.3em] uppercase text-sm">
                  Official Seal & Services
                </span>
                <div className="h-[1px] w-12 bg-secondary" />
              </div>
            </div>
            
            <p className="max-w-2xl mx-auto text-xl text-gray-700 dark:text-gray-300 mb-10 font-serif italic">
              "Official Marriage & Divorce Registration Services. Providing authentic, 
              legally binding, and traditional registration for the community with honor and integrity."
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onAuthClick}
                className="w-full sm:w-auto bg-primary text-white px-12 py-4 rounded-md font-serif text-xl hover:bg-emerald-900 transition-all shadow-xl hover:scale-105 active:scale-95 border-2 border-secondary/20"
              >
                Register Now
              </button>
              <a 
                href="#services"
                className="w-full sm:w-auto bg-white/80 dark:bg-slate-900 text-primary dark:text-accent border-2 border-primary/20 px-12 py-4 rounded-md font-serif text-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                Our Services
              </a>
            </div>
            <div className="mt-8">
              <ImageBanner />
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
          >
            {[
              { icon: ScrollText, title: 'Official Registration', desc: 'Government authorized marriage & divorce certificates.' },
              { icon: Heart, title: 'Traditional Values', desc: 'Conducted according to traditional Muhammadan laws.' },
              { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your personal data and records are handled with utmost care.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary dark:text-accent" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-2 text-primary dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}
