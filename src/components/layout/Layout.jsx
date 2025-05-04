import React from 'react';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';

function Layout({ children }) {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <div className="content min-h-screen">
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
