import React, { useContext } from 'react';
import Layout from '../../components/layout/Layout';
import myContext from '../../context/data/myContext';
import HeroSection from '../../components/heroSection/HeroSection';
import ProductCard from '../../components/productCard/productCard';
import Track from '../../components/track/Track';
//import Testimonial from '../../components/testimonial/Testimonial';

function Home() {
  return (
    <Layout>
      <div className="pt-[100px] lg:pt-30">
        <HeroSection />
        <ProductCard />
        <Track />
      </div>
    </Layout>
  );
}

export default Home;
