import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-primary dark:text-white mb-4"
          >
            Contact & Location
          </motion.h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-ambient dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700">
              <h3 className="text-2xl font-serif font-bold text-primary dark:text-white mb-8">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary dark:text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tousif Ahamed (WhatsApp)</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">6290540892</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary dark:text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sk Md Rafique</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">9932266948</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary dark:text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Office Location</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      City Centre, Beside Court<br />
                      Durgapur, Paschim Bardhaman
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary dark:text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Office Hours</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      10:00 AM - 12:00 PM<br />
                      Every Day
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden">
              <p className="text-secondary font-medium italic text-center">
                "Official Portal: MMR West Bengal Authorized"
              </p>
            </div>
          </motion.div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.481232812345!2d87.2995!3d23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f7710000000000%3A0x0!2sCity%20Centre%2C%20Durgapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
            
            <div className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 border-t border-gray-100 dark:border-slate-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                <span className="font-bold text-primary dark:text-accent">Address:</span> City Centre, Beside Court, Durgapur, Paschim Bardhaman, West Bengal
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
