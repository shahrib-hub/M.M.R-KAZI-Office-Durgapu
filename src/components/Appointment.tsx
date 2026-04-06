import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Appointment() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Marriage Registration',
    date: '',
    time: '10:00' // Default time, we can add a time picker later if needed
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: 'Marriage Registration',
          date: '',
          time: '10:00'
        });
        
        // Trigger a local notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Appointment Request Sent', {
            body: 'We have received your request and will contact you shortly.',
          });
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to submit appointment');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

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
            {t('appointment.title')}
          </motion.h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-secondary/20 text-secondary rounded-sm text-sm font-bold shadow-sm">
            <Clock className="w-4 h-4" />
            {t('appointment.hours')}
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
          
          {success ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">We have received your appointment request and will contact you shortly to confirm.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-primary text-white rounded-sm hover:bg-emerald-900 transition-colors"
              >
                Book Another
              </button>
            </div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
              {error && (
                <div className="md:col-span-2 p-4 bg-red-50 text-red-600 border border-red-200 rounded-sm text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('appointment.name')}</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('appointment.namePlaceholder')}
                  className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('appointment.email')}</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('appointment.emailPlaceholder')}
                  className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('appointment.phone')}</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder={t('appointment.phonePlaceholder')}
                  className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('appointment.serviceType')}</label>
                <select 
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif appearance-none dark:text-white"
                >
                  <option value="Marriage Registration">{t('appointment.service1')}</option>
                  <option value="Divorce Registration">{t('appointment.service2')}</option>
                  <option value="Consultation">{t('appointment.service3')}</option>
                  <option value="Other Services">{t('appointment.service4')}</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-primary dark:text-gray-300 uppercase tracking-widest">{t('appointment.date')}</label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none" />
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 rounded-sm border-2 border-gray-100 dark:border-slate-700 bg-ambient dark:bg-slate-800 focus:border-secondary outline-none transition-all font-serif dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-6">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-5 rounded-sm font-serif text-2xl hover:bg-emerald-900 transition-all shadow-lg flex items-center justify-center gap-4 group border-2 border-secondary/20 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {t('appointment.submit')}
                      <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-6 italic font-serif">
                  {t('appointment.note')}
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
