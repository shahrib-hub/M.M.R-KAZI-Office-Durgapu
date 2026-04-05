import { motion } from 'motion/react';

const images = [
  'https://ik.imagekit.io/ramwfilij/b802a629217b3fa3ac6f19bb31ad524a.jpg.jpeg',
  'https://ik.imagekit.io/ramwfilij/6a85f16e6169d316e3c79badee786700.jpg.jpeg',
  'https://ik.imagekit.io/ramwfilij/c589ebaf50b778d0e557c4e01b395f3c.jpg.jpeg',
  'https://ik.imagekit.io/ramwfilij/976e4f371977ee581e76454392317ef4.jpg.jpeg',
  'https://ik.imagekit.io/ramwfilij/8318343d0a56a0842e73d3e7bc9277c1.jpg.jpeg',
  'https://ik.imagekit.io/ramwfilij/5091672f3d7333d16e66b125021b1901.jpg.jpeg',
];

export default function ImageBanner() {
  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="w-full overflow-hidden bg-ambient dark:bg-slate-950 py-10 border-y border-secondary/10">
      <div className="relative flex">
        <motion.div
          className="flex gap-6 px-3"
          animate={{
            x: ['-50%', '0%'],
          }}
          transition={{
            duration: 40,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-72 h-48 md:w-96 md:h-64 rounded-2xl overflow-hidden shadow-lg border-2 border-primary/5 group"
            >
              <img
                src={src}
                alt={`Service Showcase ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
