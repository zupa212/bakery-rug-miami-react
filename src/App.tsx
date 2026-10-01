
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Header';
import Footer from './components/Footer';
import MobilePhoneBar from './components/MobilePhoneBar';
import Home from './pages/Home';
import MiamiRugCleaning from './pages/MiamiRugCleaning';
import Catalog from './pages/Catalog';
import CatalogDetail from './pages/CatalogDetail';
import ServicePage from './pages/ServicePage';
import Admin from './pages/Admin';
import ReviewQR from './pages/ReviewQR';
import { LanguageProvider } from './context/LanguageContext';
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

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isReviewRoute = location.pathname.startsWith('/review');

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-gold-500 selection:text-white">
        {!isAdminRoute && !isReviewRoute && <Navbar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/miami-rug-cleaning" element={<MiamiRugCleaning />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:slug" element={<CatalogDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/review" element={<ReviewQR />} />
          <Route path="/reviews" element={<ReviewQR />} />
          <Route path="*" element={<Home />} />
        </Routes>

        {!isAdminRoute && !isReviewRoute && <Footer />}
        {!isAdminRoute && !isReviewRoute && <MobilePhoneBar />}
      </div>
    </LanguageProvider>
  );
}

export default App;
