import { motion } from 'motion/react';
import { Calendar, Clock, Send } from 'lucide-react';

export default function Appointment() {
  return (
    <section id="appointment" className="py-24 bg-ambient dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-primary dark:text-white mb-4"
          >
            Book an Appointment
          </motion.h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-secondary/20 text-secondary rounded-sm text-sm font-bold shadow-sm">
            <Clock className="w-4 h-4" />
            Office Hours: 10:00 AM - 12:00 PM (Every Day)
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-sm shadow-2xl border-2 border-secondary/20 relative"
        >
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-secondary/30 -ml-2 -mt-2" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-secondary/30 -mr-2 -mt-2" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-secondary/30 -ml-2 -mb-2" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-secondary/30 -mr-2 -mb-2" />
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name"
                className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Mobile Number</label>
              <input 
                type="tel" 
                placeholder="Enter mobile number"
                className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Service Type</label>
              <select className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif appearance-none dark:text-white">
                <option>Marriage Registration</option>
                <option>Divorce Registration</option>
                <option>Kazi Consultation</option>
                <option>Other Services</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">Preferred Date</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input 
                  type="date" 
                  className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-6">
              <button className="w-full bg-primary text-white py-5 rounded-sm font-serif text-2xl hover:bg-emerald-900 transition-all shadow-lg flex items-center justify-center gap-4 group border-2 border-secondary/20">
                Submit Booking Request
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <p className="text-center text-sm text-gray-500 mt-6 italic font-serif">
                * We will contact you via mobile to confirm your appointment.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
