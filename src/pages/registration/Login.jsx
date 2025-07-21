import { Link, useNavigate } from '@tanstack/react-router'
import myContext from '../../context/data/myContext';
import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, linkWithCredential, PhoneAuthProvider } from 'firebase/auth';
import Loader from '../../components/loader/Loader';
import { Eye, EyeOff, ArrowLeft, User, Lock, Phone, Mail, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useUserTracking } from '../../hooks/useUserTracking';

function Login() {
    const { trackPage } = useUserTracking();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const context = useContext(myContext)
    const { loading,setLoading} = context
    const navigate = useNavigate();

    // Track page visit
    useEffect(() => {
        trackPage('other');
    }, [trackPage]);

    const signin = async () => {
      setLoading(true);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        toast.success('Signin Successfully', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        window.location.href='/'
        setLoading(false);
      } catch (error) {
        toast.error('Sigin Failed', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setLoading(false);
      }
    }
   
    return (
        <div className='flex justify-center items-center h-screen bg-gray-100 px-2'>
            {loading && <Loader />}
            <div className='bg-gray-800 w-full max-w-xs sm:max-w-sm px-4 sm:px-8 py-8 rounded-xl'>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>Login</h1>
                </div>
                <div>
                    <input type="email"
                        name='email'
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className='bg-gray-600 mb-4 px-3 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Email'
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className='bg-gray-600 mb-4 px-3 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Password'
                    />
                </div>
                <div className='flex justify-center mb-3'>
                    <button
                        onClick={signin}
                        className='bg-yellow-500 w-full text-black font-bold px-3 py-2 rounded-lg truncate'>
                        Login
                    </button>
                </div>
                <div>
                    <h2 className='text-white text-sm'>Don't have an account <Link className='text-yellow-500 font-bold' to={'/signup'}>Signup</Link></h2>
                </div>
                <div className="mt-3">
                    <h2 className='text-white text-sm'>Or <Link className='text-yellow-500 font-bold' to={'/phone-auth'}>Login with Phone</Link></h2>
                </div>
            </div>
        </div>
    )
}

export default Login