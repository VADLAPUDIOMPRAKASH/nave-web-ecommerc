import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import myContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';

function PhoneAuth() {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [confirmObj, setConfirmObj] = useState(null);

    const context = useContext(myContext);
    const { loading, setLoading } = context;

    useEffect(() => {
        // Clear any existing reCAPTCHA widget
        window.recaptchaVerifier = null;
    }, []);

    const generateRecaptcha = () => {
        try {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => {
                        // reCAPTCHA solved
                    },
                    'expired-callback': () => {
                        toast.error('reCAPTCHA expired. Please try again.');
                        window.recaptchaVerifier = null;
                    }
                });
            }
        } catch (error) {
            console.error('Error generating reCAPTCHA:', error);
            toast.error('Error setting up verification. Please try again.');
            window.recaptchaVerifier = null;
        }
    }

    const requestOTP = async () => {
        setLoading(true);
        
        // Input validation
        if (!phone) {
            toast.error('Please enter your phone number');
            setLoading(false);
            return;
        }

        // Remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (cleanPhone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            setLoading(false);
            return;
        }

        try {
            // Generate new reCAPTCHA for each attempt
            window.recaptchaVerifier = null;
            generateRecaptcha();
            
            const formattedPhone = '+91' + cleanPhone; // Add country code for India
            const appVerifier = window.recaptchaVerifier;
            
            if (!appVerifier) {
                throw new Error('reCAPTCHA not initialized properly');
            }

            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmObj(confirmationResult);
            setShowOTP(true);
            toast.success('OTP sent successfully!');
        } catch (error) {
            console.error('Error sending OTP:', error);
            let errorMessage = 'Failed to send OTP. Please try again.';
            
            if (error.code === 'auth/invalid-phone-number') {
                errorMessage = 'Invalid phone number format';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errorMessage = 'reCAPTCHA verification failed. Please try again.';
            }
            
            toast.error(errorMessage);
            
            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    }

    const verifyOTP = async () => {
        setLoading(true);
        
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const result = await confirmObj.confirm(otp);
            const user = {
                name: name || 'User',
                uid: result.user.uid,
                phoneNumber: result.user.phoneNumber,
                time: Timestamp.now()
            }
            
            // Save user data to Firestore
            const userRef = collection(fireDB, "users");
            await addDoc(userRef, user);
            
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(result));
            
            toast.success('Login Successful!');
            window.location.href = '/';
        } catch (error) {
            console.error('Error verifying OTP:', error);
            let errorMessage = 'Invalid OTP. Please try again.';
            
            if (error.code === 'auth/code-expired') {
                errorMessage = 'OTP has expired. Please request a new one.';
                setShowOTP(false);
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex justify-center items-center h-screen'>
            {loading && <Loader />}
            <div className='bg-gray-800 px-10 py-10 rounded-xl'>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>
                        {showOTP ? 'Verify OTP' : 'Phone Login'}
                    </h1>
                </div>
                
                {!showOTP ? (
                    <>
                        <div>
                            <input type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                                placeholder='Name (Optional)'
                            />
                        </div>
                        <div>
                            <input type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                                className='bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                                placeholder='Phone Number (10 digits)'
                                maxLength="10"
                                pattern="[0-9]*"
                            />
                        </div>
                        <div className='flex justify-center mb-3'>
                            <button
                                onClick={requestOTP}
                                className='bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg'>
                                Send OTP
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <input type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className='bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                                placeholder='Enter 6-digit OTP'
                                maxLength="6"
                                pattern="[0-9]*"
                            />
                        </div>
                        <div className='flex justify-center mb-3'>
                            <button
                                onClick={verifyOTP}
                                className='bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg'>
                                Verify OTP
                            </button>
                        </div>
                        <div className='flex justify-center mb-3'>
                            <button
                                onClick={() => {
                                    setShowOTP(false);
                                    setOtp('');
                                    window.recaptchaVerifier = null;
                                }}
                                className='bg-gray-600 w-full text-white font-bold px-2 py-2 rounded-lg'>
                                Try Different Number
                            </button>
                        </div>
                    </>
                )}
                
                <div>
                    <h2 className='text-white'>
                        Want to use email instead?{' '}
                        <Link className='text-yellow-500 font-bold' to={'/login'}>
                            Login with Email
                        </Link>
                    </h2>
                </div>
                <div id="recaptcha-container"></div>
            </div>
        </div>
    )
}

export default PhoneAuth; 