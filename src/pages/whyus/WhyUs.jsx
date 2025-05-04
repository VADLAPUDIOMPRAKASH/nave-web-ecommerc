import React from 'react';
import Layout from '../../components/layout/Layout';

const WhyUsPage = () => {
    return (
        <Layout>
            <section className="why-us-section">
                <div className="container mx-auto py-20">
                    <h1 className="text-3xl font-bold text-center mb-8 mt-10">Why Choose Navedhana?</h1>
                    <p className="text-center text-lg mb-12">
                        At Navedhana, our primary focus is on empowering farmers by removing the burden of marketing their perishable crops. We ensure fresh, farm-to-table vegetables for our customers, all within 8 hours of harvest. Here's why our solution is a game-changer for both farmers and consumers.
                    </p>

                    {/* Key Benefits Section */}
                    <div className="flex flex-wrap -mx-4">
                        {/* Benefit 1 */}
                        <div className="p-4 w-full lg:w-1/2">
                            <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold text-green-600">Supporting Farmers First</h2>
                                <p className="mt-4 text-base">
                                    Our mission is to take the marketing stress off farmers' shoulders. We help farmers sell their perishable crops quickly, ensuring they receive fair compensation without the need to worry about middlemen or transportation logistics. By focusing on the farmers, we help prevent crop wastage and boost their income.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 2 */}
                        <div className="p-4 w-full lg:w-1/2">
                            <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold text-green-600">Fresh Vegetables in 8 Hours</h2>
                                <p className="mt-4 text-base">
                                    For our customers, we deliver vegetables within 8 hours of harvest. This means you get the freshest produce possible, harvested and delivered on the same day. Our platform even includes a harvest countdown, so you know exactly when your vegetables were picked!
                                </p>
                            </div>
                        </div>

                        {/* Benefit 3 */}
                        <div className="p-4 w-full lg:w-1/2">
                            <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold text-green-600">Bulk Orders with Streamlined Delivery</h2>
                                <p className="mt-4 text-base">
                                    We start by delivering bulk orders to apartment complexes and colonies using a single vehicle, ensuring an efficient and cost-effective process. This helps us keep delivery charges low for consumers while still maintaining high standards for freshness and quality.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 4 */}
                        <div className="p-4 w-full lg:w-1/2">
                            <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-semibold text-green-600">Fair Compensation for Farmers</h2>
                                <p className="mt-4 text-base">
                                    We work directly with farmers, offering them market prices without the interference of middlemen or commissions. This means farmers keep more of their hard-earned profits, and customers benefit from knowing their purchases directly support local agriculture.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <a href="/allproducts" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                            Start Supporting Local Farmers Today!
                        </a>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default WhyUsPage;
