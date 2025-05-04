import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { toast } from 'react-toastify';
import { 
    Package, 
    IndianRupee, 
    Tags, 
    FileText, 
    Image as ImageIcon,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import myContext from '../../../context/data/myContext';
import { fireDB, imgDB } from '../../../firebase/FirebaseConfig';

function AddProduct() {
    const navigate = useNavigate();
    const context = useContext(myContext);
    const { mode } = context;

    const [product, setProduct] = useState({
        title: '',
        price: '',
        category: '',
        description: '',
        weight: '',
        actualPrice: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const categories = [
        'Vegetables',
        'Fruits',
        'Leafy Greens',
        'Root Vegetables',
        'Exotic Vegetables',
        'Organic Products'
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const imageRef = ref(imgDB, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        return await getDownloadURL(imageRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!product.title || !product.price || !product.category || !imageFile) {
                toast.error('Please fill in all required fields and add an image');
                return;
            }

            // Upload image
            const imageUrl = await uploadImage();
            if (!imageUrl) {
                toast.error('Failed to upload image');
                return;
            }

            // Add product to Firestore
            const productData = {
                ...product,
                imageUrl,
                date: new Date().toLocaleString(
                    "en-US",
                    {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                    }
                )
            };

            await addDoc(collection(fireDB, "products"), productData);
            toast.success('Product added successfully!');
            navigate('/dashboard');

        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center ${
                            mode === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'
                        }`}
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Add New Product
                    </h1>
                </div>

                {/* Form */}
                <div className={`${mode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Product Image *
                            </label>
                            <div className="flex items-center justify-center">
                                <div className={`w-full max-w-md h-64 relative rounded-lg border-2 border-dashed ${
                                    mode === 'dark' ? 'border-gray-600' : 'border-gray-300'
                                } ${imagePreview ? 'p-0' : 'p-4'}`}>
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center">
                                            <ImageIcon className={`w-12 h-12 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                                            <p className={`mt-2 text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Click to upload or drag and drop
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Product Name *
                                </label>
                                <div className="relative">
                                    <Package className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={product.title}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                                            mode === 'dark'
                                                ? 'bg-gray-700 text-white placeholder-gray-400'
                                                : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                                        placeholder="Enter product name"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Category *
                                </label>
                                <div className="relative">
                                    <Tags className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="category"
                                        value={product.category}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                                            mode === 'dark'
                                                ? 'bg-gray-700 text-white'
                                                : 'bg-gray-50 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Price (₹) *
                                </label>
                                <div className="relative">
                                    <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="price"
                                        value={product.price}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                                            mode === 'dark'
                                                ? 'bg-gray-700 text-white placeholder-gray-400'
                                                : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                                        placeholder="Enter price"
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Weight (kg)
                                </label>
                                <div className="relative">
                                    <Package className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="weight"
                                        value={product.weight}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                                            mode === 'dark'
                                                ? 'bg-gray-700 text-white placeholder-gray-400'
                                                : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                                        placeholder="Enter weight"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Description
                            </label>
                            <div className="relative">
                                <FileText className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                <textarea
                                    name="description"
                                    value={product.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                                        mode === 'dark'
                                            ? 'bg-gray-700 text-white placeholder-gray-400'
                                            : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                                    placeholder="Enter product description"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center px-6 py-3 rounded-lg text-white ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Adding Product...
                                    </>
                                ) : (
                                    'Add Product'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;
