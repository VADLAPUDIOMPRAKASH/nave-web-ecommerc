import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { Leaf } from 'lucide-react';
import myContext from '../../context/data/myContext';

export default function Footer() {
    const context = useContext(myContext);
    const { mode } = context;

    return (
        <footer className={`${
            mode === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Leaf className="w-6 h-6 text-green-600" />
                            <h2 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Navedhana
                            </h2>
                        </div>
                        <p className="text-sm mb-4">
                            Connecting farmers directly with consumers, delivering fresh vegetables within 8 hours of harvest.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                                <FiLinkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                            mode === 'dark' ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-sm hover:text-green-600 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/allproducts" className="text-sm hover:text-green-600 transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/whyus" className="text-sm hover:text-green-600 transition-colors">
                                    Why Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm hover:text-green-600 transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                            mode === 'dark' ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                            Customer Service
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/returnpolicy" className="text-sm hover:text-green-600 transition-colors">
                                    Return Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacypolicy" className="text-sm hover:text-green-600 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-sm hover:text-green-600 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                            mode === 'dark' ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                            Contact Info
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <FiMapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">
                                    123 Farmer's Market Street, Hyderabad, Telangana 500032
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiPhone className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm">+91 (800) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiMail className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm">support@navedhana.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={`py-4 border-t ${
                    mode === 'dark' ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm">
                            © 2024 Navedhana. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Supporting Local Farmers</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
