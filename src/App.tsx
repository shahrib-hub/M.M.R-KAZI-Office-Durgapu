import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Appointment from './components/Appointment';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingButtons from './components/WhatsAppButton';
import AuthModal from './components/AuthModal';

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const toggleAuth = () => setIsAuthOpen(!isAuthOpen);

  return (
    <div className="min-h-screen font-sans selection:bg-primary selection:text-white">
      <Navbar onAuthClick={toggleAuth} />
      
      <main>
        <Hero onAuthClick={toggleAuth} />
        <About />
        <Services />
        <Appointment />
        <Contact />
      </main>

      <Footer />
      
      <FloatingButtons />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
}
