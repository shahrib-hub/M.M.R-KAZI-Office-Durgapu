import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-ambient dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-primary dark:text-white mb-4"
          >
            About Our Office
          </motion.h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Member 1 */}
            <div className="relative">
              <div className="traditional-border bg-white dark:bg-slate-900 ornate-corner top-left top-right bottom-left bottom-right">
                <div className="aspect-[4/5] overflow-hidden shadow-xl">
                  <img 
                    src="https://i.ibb.co/zhtRN6np/IMG-20251015-132821-jpg.jpg" 
                    alt="Tousif Ahamed" 
                    className="w-full h-full object-cover transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-sm shadow-xl hidden md:block border-2 border-secondary/30">
                <p className="text-white font-serif text-xl font-bold mb-1">Tousif Ahamed</p>
                <p className="text-emerald-200 text-xs tracking-widest uppercase">Official Marriage Registrar & Kazi</p>
              </div>
            </div>

            {/* Member 2 */}
            <div className="relative">
              <div className="traditional-border bg-white dark:bg-slate-900 ornate-corner top-left top-right bottom-left bottom-right">
                <div className="aspect-[4/5] overflow-hidden shadow-xl">
                  <img 
                    src="https://i.ibb.co/MkYckcNN/2205-removebg-preview.png" 
                    alt="Sk Md Rafique" 
                    className="w-full h-full object-cover transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-sm shadow-xl hidden md:block border-2 border-secondary/30">
                <p className="text-white font-serif text-xl font-bold mb-1">Sk Md Rafique</p>
                <p className="text-emerald-200 text-xs tracking-widest uppercase">Senior Kazi</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-32"
          >
            <h3 className="text-3xl font-serif font-bold text-primary dark:text-white mb-6">
              Authorized Registration Board
            </h3>
            <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Official Muhammadan Marriage And Divorce Registrar & Kazi for Durgapur City Centre, 
                authorized by the West Bengal Muhammadan Marriage Registrar Board.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border-l-4 border-secondary">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">District</p>
                  <p className="font-bold text-primary dark:text-white">Paschim Bardhaman</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border-l-4 border-secondary">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="font-bold text-primary dark:text-white">Durgapur City Centre (District No. 18)</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border-l-4 border-secondary">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sanad No</p>
                  <p className="font-bold text-primary dark:text-white">15-JD/XIV/4M-108/2014</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border-l-4 border-secondary">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Licence No</p>
                  <p className="font-bold text-primary dark:text-white">959-J/XII-960/(4)-J/XII 2004</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
