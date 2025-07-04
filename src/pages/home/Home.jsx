import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import myContext from '../../context/data/myContext';
import HeroSection from '../../components/heroSection/HeroSection';
import ProductCard from '../../components/productCard/productCard';
import Track from '../../components/track/Track';
import TermsModal from '../../components/modal/TermsModal';
//import Testimonial from '../../components/testimonial/Testimonial';

function Home() {
  const [showTerms, setShowTerms] = useState(false);
  const [showNotice, setShowNotice] = useState(() => {
    return localStorage.getItem('orderNoticeAccepted') !== 'true';
  });

  useEffect(() => {
    // Check if user is logged in and if terms have been accepted
    const user = localStorage.getItem('user');
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (user && !termsAccepted) {
      setShowTerms(true);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setShowTerms(false);
  };

  const handleNoticeOkay = () => {
    localStorage.setItem('orderNoticeAccepted', 'true');
    setShowNotice(false);
  };

  return (
    <Layout>
      <div className="pt-[100px] lg:pt-30">
        <HeroSection />
        <ProductCard />
        <Track />
        <TermsModal open={showTerms} onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
        {showNotice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Blurred overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl px-8 py-6 max-w-md w-full text-center border-2 border-green-600">
              <div className="text-green-700 text-lg font-semibold mb-2">Order Times: 8:00 AM – 10:00 PM</div>
              <div className="text-gray-700 mb-4">Orders placed after 9:00 PM will be delivered with the next day's harvest.</div>
              <button onClick={handleNoticeOkay} className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">Accept</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Home;
