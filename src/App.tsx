import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Appointment from './components/Appointment';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingButtons from './components/WhatsAppButton';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    fetch('/api/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleAuth = () => setIsAuthOpen(!isAuthOpen);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ambient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen font-sans selection:bg-primary selection:text-white">
          <Navbar 
            onAuthClick={toggleAuth} 
            isAdmin={!!user}
            onAdminPanelClick={() => navigate('/admin')}
            onLogout={handleLogout}
          />
          
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
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      } />
      
      <Route path="/admin/*" element={
        user ? (
          <AdminPanel 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : (
          <Navigate to="/" replace />
        )
      } />
    </Routes>
  );
}

