import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';

// Add CSS to hide scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

function ProductCard() {
    const context = useContext(myContext);
    const { mode, product, searchkey } = context;
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);
    const navigate = useNavigate();

    useEffect(() => {
        // Add the styles to the document
        const styleSheet = document.createElement("style");
        styleSheet.innerText = scrollbarHideStyles;
        document.head.appendChild(styleSheet);

        return () => {
            // Clean up the styles when component unmounts
            document.head.removeChild(styleSheet);
        };
    }, []);

    const addCart = (product) => {
        dispatch(addToCart(product));
        toast.success('Added to cart');
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const filteredProducts = product.filter((obj) =>
        obj.title.toLowerCase().includes(searchkey.toLowerCase())
    );

    const vegetables = filteredProducts.filter(item => item.category === 'Vegetables');
    const leafyVegetables = filteredProducts.filter(item => item.category === 'Leafy Vegetables');

    const calculateDiscount = (actualPrice, price) => {
        const discount = ((actualPrice - price) / actualPrice) * 100;
        return Math.round(discount);
    };

    const ProductContainer = ({ title, products }) => {
        return (
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl sm:text-2xl font-medium title-font mb-1"
                            style={{ color: mode === 'dark' ? 'white' : '' }}>
                            {title}
                        </h1>
                        <div className="h-1 w-16 bg-green-500 rounded"></div>
                    </div>

                    <button
                        onClick={() => navigate('/allproducts')}
                        className="inline-flex items-center text-green-500 hover:text-green-600 text-sm"
                    >
                        View All
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>

                <div className="relative overflow-x-auto sm:overflow-x-hidden pb-4">
                    <div className="flex flex-nowrap sm:flex-wrap gap-2
                                  overflow-x-auto scrollbar-hide
                                  scroll-smooth
                                  -mx-2 px-2 sm:mx-0 sm:px-0
                                  sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                        {products.map((item) => {
                            const { title, price, imageUrl, id, actualprice } = item;
                            const discountPercentage = calculateDiscount(actualprice, price);

                            return (
                                <div
                                    key={id}
                                    onClick={() => window.location.href = `/productinfo/${id}`}
                                    className="w-[160px] sm:w-full flex-none sm:flex-auto cursor-pointer"
                                >
                                    <div className={`h-full border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                                        mode === 'dark' ? 'bg-gray-800 border-gray-700' : ''
                                    }`}>
                                        {/* Image Container */}
                                        <div className="relative pt-[100%] overflow-hidden">
                                            <img
                                                className="absolute top-0 left-0 w-full h-full object-cover p-2 rounded-xl 
                                                          group-hover:scale-105 transition-transform duration-200"
                                                src={imageUrl}
                                                alt={title}
                                            />
                                            {/* Discount Badge */}
                                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                {discountPercentage}% OFF
                                            </div>
                                        </div>
                                        
                                        {/* Content Container */}
                                        <div className="p-3 text-center">
                                            <h2 className="text-xs font-medium mb-1 text-green-600">
                                                {item.category}
                                            </h2>
                                            <h1 
                                                className="text-sm md:text-base font-medium mb-1 truncate px-2"
                                                style={{ color: mode === 'dark' ? 'white' : '' }}
                                            >
                                                {title}
                                            </h1>
                                            <div className="flex justify-center items-center gap-2 mb-2">
                                                <p className="text-sm md:text-base font-bold text-green-600">
                                                    ₹{price}
                                                </p>
                                                <p className="text-sm text-gray-500 line-through">
                                                    ₹{actualprice}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addCart(item);
                                                }}
                                                className="w-full py-1.5 px-2 text-xs md:text-sm bg-green-500 text-white rounded-lg 
                                                          hover:bg-green-600 transition-colors duration-200 focus:outline-none 
                                                          focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                                            >
                                                Add To Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {vegetables.length > 0 && (
                <ProductContainer title="Fresh Vegetables" products={vegetables} />
            )}
            {leafyVegetables.length > 0 && (
                <ProductContainer title="Leafy Vegetables" products={leafyVegetables} />
            )}
        </div>
    );
}

export default ProductCard;