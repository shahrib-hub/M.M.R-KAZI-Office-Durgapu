import { MessageCircle, Instagram, Facebook, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function FloatingButtons() {
  const phoneNumber = '916290540892';
  const message = 'Hello, I would like to inquire about your marriage registration services.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 md:gap-4">
      <motion.a
        href={`tel:+${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-2xl flex items-center justify-center"
        aria-label="Call us"
      >
        <Phone className="w-6 h-6 md:w-8 md:h-8" />
      </motion.a>
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
      </motion.a>
      <motion.a
        href="https://www.instagram.com/kazi_office_durgapur"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white p-3 md:p-4 rounded-full shadow-2xl flex items-center justify-center"
        aria-label="Instagram"
      >
        <Instagram className="w-6 h-6 md:w-8 md:h-8" />
      </motion.a>
      <motion.a
        href="https://www.facebook.com/share/1Z6huK8cgx/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-[#1877F2] text-white p-3 md:p-4 rounded-full shadow-2xl flex items-center justify-center"
        aria-label="Facebook"
      >
        <Facebook className="w-6 h-6 md:w-8 md:h-8" />
      </motion.a>
    </div>
  );
}
