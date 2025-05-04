import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { addToCart } from '../../redux/cartSlice';
import { fireDB } from '../../firebase/FirebaseConfig';
import Layout from '../../components/layout/Layout';
import myContext from '../../context/data/myContext';
import { Leaf } from 'lucide-react';

function ProductInfo() {
    const context = useContext(myContext);
    const { loading, setLoading } = context;
    const [products, setProducts] = useState('');
    const [quantity, setQuantity] = useState(1);
    const params = useParams();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    const getProductData = async () => {
        setLoading(true);
        try {
            const productTemp = await getDoc(doc(fireDB, "products", params.id));
            setProducts(productTemp.data());
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        getProductData();
    }, []);

    const addCart = (products) => {
        const productWithQuantity = { ...products, quantity };
        dispatch(addToCart(productWithQuantity));
        toast.success('Added to cart');
    }

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {products && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Product Image */}
                            <div className="lg:w-1/2">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <img
                                        src={products.imageUrl}
                                        alt={products.title}
                                        className="w-full h-[300px] lg:h-[500px] object-cover"
                                    />
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="lg:w-1/2">
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                        <Leaf className="w-5 h-5" />
                                        <span className="text-sm font-medium">Fresh Produce</span>
                                    </div>

                                    <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
                                        {products.title}
                                    </h1>

                                    <div className="flex items-center mb-6">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        {/* <span className="text-gray-500 ml-3">(3.0) • Fresh Stock Daily</span> */}
                                    </div>

                                    <div className="prose prose-green max-w-none mb-6">
                                        <p className="text-gray-600">{products.description}</p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center">
                                                <span className="text-3xl font-bold text-gray-900">₹{products.price}</span>
                                                <span className="text-sm text-gray-500 ml-2">per kg</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center">{quantity} kg</span>
                                                <button 
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => addCart(products)}
                                                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                                            >
                                                Add to Cart
                                            </button>
                                            <button className="flex-1 border border-green-600 text-green-600 py-3 px-6 rounded-lg font-medium hover:bg-green-50 transition-colors duration-200">
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Fresh from local farmers
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Same day delivery available
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Quality guaranteed
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default ProductInfo;