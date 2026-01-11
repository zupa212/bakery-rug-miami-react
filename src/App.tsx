
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Header';
import Footer from './components/Footer';
import MobilePhoneBar from './components/MobilePhoneBar';
import Home from './pages/Home';
import MiamiRugCleaning from './pages/MiamiRugCleaning';
import { initGA, logPageView } from './utils/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  // Track Page Views and Reset Scroll on Route Change
  useEffect(() => {
    logPageView();
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-gold-500 selection:text-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/miami-rug-cleaning" element={<MiamiRugCleaning />} />
        {/* Catch-all redirects to Home for now to prevent 404s on SPA refresh if not configured serverside, 
            though Vercel handles this usually. */}
        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
      <MobilePhoneBar />
    </div>
  );
}

export default App;
