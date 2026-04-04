import { motion } from 'motion/react';
import { FileText, FileX, Users, Award } from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: 'Marriage Registration',
      desc: 'Official registration of Nikah with government-validated certificates. We ensure all legal requirements are met.',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    },
    {
      title: 'Divorce Registration',
      desc: 'Professional and formal divorce registration services with proper documentation and official certification.',
      icon: FileX,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    },
    {
      title: 'Kazi Services',
      desc: 'Traditional Kazi services for conducting Nikah ceremonies and providing religious guidance on marital matters.',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'Official Certification',
      desc: 'Issuance of official seals and signatures validated by the MMR Board for all legal purposes.',
      icon: Award,
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ];

  return (
    <section id="services" className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-primary dark:text-white mb-4"
          >
            Our Services
          </motion.h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
          <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-400 font-serif italic">
            "We provide a comprehensive range of official registration services, 
            ensuring every step is handled with professionalism and traditional respect."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-ambient dark:bg-slate-800 p-8 rounded-sm shadow-sm hover:shadow-xl transition-all border-2 border-secondary/10 hover:border-secondary/40 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 -mr-8 -mt-8 rotate-45" />
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 border border-secondary/20 ${service.color}`}>
                <service.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary dark:text-white mb-4">
                {service.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed font-medium">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
