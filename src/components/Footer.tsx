import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary dark:bg-slate-950 text-white py-16 islamic-pattern border-t-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 max-w-md">
            <img 
              src="https://i.ibb.co/KjJSFyzK/Airbrush-BG-CHANGER-1775314610814.png" 
              alt="Muhammadan Marriage And Divorce Registrar & Kazi" 
              className="w-full h-auto drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <p className="text-emerald-100/70 max-w-md mb-10 italic font-serif">
            "Providing official, legal, and traditional registration services 
            for the community with honor and integrity since 2004."
          </p>

          <div className="w-full h-[1px] bg-white/10 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 text-sm text-emerald-100/50">
            <p>© 2024 M.M.R & KAZI Office Durgapur</p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/kazi_office_durgapur" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/share/1Z6huK8cgx/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <p>Authorized by MMR West Bengal</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
