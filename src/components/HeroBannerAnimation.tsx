import { motion } from 'motion/react';

export default function HeroBannerAnimation() {
  const phrases = [
    "Authentic Registration",
    "Legally Binding",
    "Traditional Values",
    "Privacy Guaranteed",
    "Professional Service"
  ];

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="relative flex">
        <motion.div
          className="flex gap-12 px-6"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {[...phrases, ...phrases].map((phrase, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-primary/60 dark:text-accent/60 font-serif text-lg tracking-widest uppercase"
            >
              {phrase}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
