import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { addDoc, collection, doc, getDoc, updateDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { fireDB } from '../../firebase/FirebaseConfig'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { clearCart } from '../../redux/cartSlice'

export default function Modal({ name, address, pincode, phoneNumber, setName, setAddress, setPincode, setPhoneNumber, cartItems = [], totalAmount, houseNo, setHouseNo, landmark, setLandmark, blockNo, setBlockNo, userEmail, city, setCity, state, setState }) {
    const [isOpen, setIsOpen] = useState(false)
    const dispatch = useDispatch()
    const [deliveryCharges, setDeliveryCharges] = useState(0)
    const [errors, setErrors] = useState({})
    const [alternatePhone, setAlternatePhone] = useState("")
    const [isPhoneLogin, setIsPhoneLogin] = useState(false)
    const [localEmail, setLocalEmail] = useState("")

    useEffect(() => {
        const fetchDeliveryCharges = async () => {
            try {
                const docRef = doc(fireDB, 'settings', 'deliveryCharges')
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setDeliveryCharges(Number(docSnap.data().value) || 0)
                }
            } catch (err) {
                setDeliveryCharges(0)
            }
        }
        fetchDeliveryCharges()
    }, [])

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))?.user;
        // Check if user logged in with phone (no email)
        const isPhoneUser = !user?.email;
        setIsPhoneLogin(isPhoneUser);
        
        // Initialize email state
        if (isPhoneUser) {
            setLocalEmail(""); // Clear email for phone users
        } else {
            setLocalEmail(user?.email || ""); // Set email from user data
        }
    }, [])

    const grandTotal = Number(totalAmount) + Number(deliveryCharges)
    const subtotal = Number(totalAmount)

    function closeModal() {
        setIsOpen(false)
        setErrors({})
    }

    function openModal() {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user?.uid) {
            toast.info('Please login to continue.', {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
           
            return;
        }
        setIsOpen(true);
    }

    // Validation helpers
    const isOnlyAlphabets = (str) => /^[A-Za-z ]+$/.test(str.trim());
    const isValidPhone = (str) => {
        if (!/^[6789]\d{9}$/.test(str)) return false;
        // Check for repeated digits (e.g., 1111111111, 2222222222, ...)
        if (/^([0-9])\1{9}$/.test(str)) return false;
        // Check for sequential numbers (e.g., 1234567890, 9876543210)
        if (/0123456789|1234567890|9876543210|0987654321/.test(str)) return false;
        return true;
    };
    const isValidPincode = (str) => /^5[0-9]{5}$/.test(str);
    const isNotEmpty = (str) => str && str.trim().length > 0;
    const isValidAlternatePhone = (str) => {
        if (!str) return true; // optional
        if (!/^[6789]\d{9}$/.test(str)) return false;
        if (/^([0-9])\1{9}$/.test(str)) return false;
        if (/0123456789|1234567890|9876543210|0987654321/.test(str)) return false;
        if (str === phoneNumber) return false;
        return true;
    };

    // Add email validation
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateFields = () => {
        const newErrors = {};
        if (!isNotEmpty(name)) newErrors.name = 'Please enter your full name.';
        else if (!isOnlyAlphabets(name)) newErrors.name = 'Please enter a valid name using only letters and spaces.';
        if (!isNotEmpty(phoneNumber)) newErrors.phoneNumber = 'Please enter your 10-digit mobile number.';
        else if (!isValidPhone(phoneNumber)) newErrors.phoneNumber = 'Enter a valid 10-digit mobile number that starts with 6, 7, 8, or 9. Sequential numbers and repeated digits are not allowed.';
        
        // Email validation for phone login users
        if (isPhoneLogin) {
            if (!isNotEmpty(localEmail)) {
                newErrors.email = 'Email is required.';
            } else if (!isValidEmail(localEmail)) {
                newErrors.email = 'Please enter a valid email address.';
            }
        }

        if (!isNotEmpty(houseNo)) newErrors.houseNo = 'Please enter your house, door, or flat number.';
        if (!isNotEmpty(blockNo)) newErrors.blockNo = 'Please enter your road or block number.';
        if (!isNotEmpty(landmark)) newErrors.landmark = 'Please provide a landmark to help us find your address.';
        if (!isNotEmpty(address)) newErrors.address = 'Please enter your street and area.';
        if (!isNotEmpty(pincode)) newErrors.pincode = 'Please enter your 6-digit pincode.';
        else if (!isValidPincode(pincode)) newErrors.pincode = 'Pincode must be exactly 6 digits and start with 5 (e.g., 500001).';
        if (alternatePhone && !isValidAlternatePhone(alternatePhone)) newErrors.alternatePhone = 'Enter a valid alternate 10-digit mobile number that starts with 6, 7, 8, or 9. Sequential numbers and repeated digits are not allowed. Must be different from primary number.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateOrderId = async () => {
        const now = new Date();
        const year = now.getFullYear();
        const date = String(now.getDate()).padStart(2, '0');
        const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        // Query Firestore for the highest order number for this year/month/date
        const prefix = `NAV${year}${date}${month}`;
        const ordersRef = collection(fireDB, 'orders');
        const q = query(
            ordersRef,
            where('orderId', '>=', prefix),
            where('orderId', '<', prefix + 'Z'),
            orderBy('orderId', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(q);
        let nextNum = 1;
        if (!snapshot.empty) {
            const lastOrderId = snapshot.docs[0].data().orderId;
            const match = lastOrderId && lastOrderId.match(/(\d{5})$/);
            if (match) {
                nextNum = parseInt(match[1], 10) + 1;
            }
        }
        const numStr = String(nextNum).padStart(5, '0');
        return `${prefix}${numStr}`;
    };

    const handleOrderNow = async () => {
        if (!validateFields()) return;
        
        // Use localEmail for phone login users, otherwise use userEmail
        const emailToUse = isPhoneLogin ? localEmail : userEmail;

        const orderId = await generateOrderId();
        const orderInfo = {
            orderId,
            cartItems: cartItems.map(item => ({
                ...item,
                quantity: item.quantity
            })),
            addressInfo: {
                name,
                address,
                pincode,
                phoneNumber,
                alternatePhone,
                houseNo,
                landmark,
                blockNo,
                city: city || "",
                state: state || "",
                date: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                })
            },
            date: new Date().toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }),
            timestamp: new Date().toISOString(),
            email: emailToUse,
            userid: JSON.parse(localStorage.getItem("user"))?.user?.uid,
            paymentMethod: "Cash on Delivery",
            status: "placed",
            subtotal,
            deliveryCharges,
            grandTotal,
            totalAmount: grandTotal
        }

        try {
            const orderRef = collection(fireDB, 'orders')
            await addDoc(orderRef, orderInfo)
            
            // Update user profile with latest delivery details
            const userId = JSON.parse(localStorage.getItem("user"))?.user?.uid;
            if (userId) {
                const userRef = doc(fireDB, 'users', userId);
                await updateDoc(userRef, {
                    name,
                    address,
                    pincode,
                    phone: phoneNumber,
                    alternatePhone,
                    houseNo,
                    landmark,
                    blockNo,
                    city: city || "",
                    state: state || "",
                });
            }

            dispatch(clearCart())
            setName("")
            setAddress("")
            setPincode("")
            setPhoneNumber("")
            setHouseNo("")
            setLandmark("")
            setBlockNo("")
            toast.success('Order placed successfully')
            closeModal()
        } catch (error) {
            console.log(error)
            toast.error('Failed to place order')
        }
    }

    return (
        <>
            <div className="text-center rounded-lg text-white font-bold">
                <button
                    type="button"
                    onClick={openModal}
                    className="w-full bg-violet-600 py-2 text-center rounded-lg text-white font-bold"
                >
                    Order Now
                </button>
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto flex items-center justify-center mt-16 sm:mt-24">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg sm:max-h-[90vh] max-h-[95vh] transform overflow-hidden rounded-2xl p-0 text-left align-middle shadow-2xl transition-all bg-white flex flex-col">
                                    <div className="bg-gradient-to-r from-green-100 via-blue-50 to-pink-100 p-6 rounded-t-2xl border-b border-gray-200">
                                    <Dialog.Title
                                        as="h3"
                                            className="text-2xl font-extrabold leading-6 text-green-700 mb-1 bg-gradient-to-r from-pink-400 via-green-400 to-blue-400 bg-clip-text text-transparent"
                                    >
                                        Complete Your Order
                                    </Dialog.Title>
                                        <p className="text-sm text-gray-600">Please fill in your delivery details below.</p>
                                    </div>
                                    <div className="overflow-y-auto px-6 py-4 flex-1 scrollbar-thin">
                                        <form className="space-y-6">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Personal Details</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex flex-col">
                                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Full Name <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-green-500">
                                                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                id="name"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                className="pl-8 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                                placeholder="Full Name"
                                                            />
                                                        </div>
                                                        {errors.name && <span className="text-xs text-red-600 mt-1">{errors.name}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Phone Number <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-green-500">
                                                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" fill="currentColor"/></svg>
                                                            </span>
                                                            <input
                                                                type="tel"
                                                                name="phoneNumber"
                                                                id="phoneNumber"
                                                                value={phoneNumber}
                                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                                className="pl-8 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                                placeholder="Phone Number"
                                                            />
                                                        </div>
                                                        {errors.phoneNumber && <span className="text-xs text-red-600 mt-1">{errors.phoneNumber}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Alternate Phone Number
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-green-500">
                                                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" fill="currentColor"/></svg>
                                                            </span>
                                                            <input
                                                                type="tel"
                                                                name="alternatePhone"
                                                                id="alternatePhone"
                                                                value={alternatePhone}
                                                                onChange={e => setAlternatePhone(e.target.value)}
                                                                className="pl-8 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                                placeholder="Alternate Phone Number"
                                                            />
                                                        </div>
                                                        {errors.alternatePhone && <span className="text-xs text-red-600 mt-1">{errors.alternatePhone}</span>}
                                                    </div>
                                                    <div className="flex flex-col sm:col-span-2">
                                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Email <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-green-500">
                                                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20V8.99l8 6.99 8-6.99V20H4z" fill="currentColor"/></svg>
                                                            </span>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                id="email"
                                                                value={isPhoneLogin ? localEmail : userEmail}
                                                                onChange={(e) => isPhoneLogin ? setLocalEmail(e.target.value) : null}
                                                                disabled={!isPhoneLogin}
                                                                className={`pl-8 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${!isPhoneLogin ? 'bg-gray-100' : 'bg-white'}`}
                                                                placeholder="Email"
                                                            />
                                                        </div>
                                                        {errors.email && <span className="text-xs text-red-600 mt-1">{errors.email}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Address Details</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex flex-col">
                                                        <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700 mb-1">
                                                            House/Door/Flat No <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="houseNo"
                                                            id="houseNo"
                                                            value={houseNo}
                                                            onChange={(e) => setHouseNo(e.target.value)}
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                            placeholder="House/Door/Flat No"
                                                        />
                                                        {errors.houseNo && <span className="text-xs text-red-600 mt-1">{errors.houseNo}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="blockNo" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Road/Block No <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="blockNo"
                                                            id="blockNo"
                                                            value={blockNo}
                                                            onChange={(e) => setBlockNo(e.target.value)}
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                            placeholder="Road/Block No"
                                                        />
                                                        {errors.blockNo && <span className="text-xs text-red-600 mt-1">{errors.blockNo}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Landmark <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="landmark"
                                                            id="landmark"
                                                            value={landmark}
                                                            onChange={(e) => setLandmark(e.target.value)}
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                            placeholder="Landmark"
                                                        />
                                                        {errors.landmark && <span className="text-xs text-red-600 mt-1">{errors.landmark}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Address (Street, Area) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            id="address"
                                                            value={address}
                                                            onChange={(e) => setAddress(e.target.value)}
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                            placeholder="Address (Street, Area)"
                                                        />
                                                        {errors.address && <span className="text-xs text-red-600 mt-1">{errors.address}</span>}
                                                    </div>
                                                    <div className="flex flex-col sm:col-span-2">
                                                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Pincode <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="pincode"
                                                            id="pincode"
                                                            value={pincode}
                                                            onChange={(e) => setPincode(e.target.value)}
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                            placeholder="Pincode"
                                                        />
                                                        {errors.pincode && <span className="text-xs text-red-600 mt-1">{errors.pincode}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                            City <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            id="city"
                                                            value={city}
                                                            onChange={(e) => setCity(e.target.value)}
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                            placeholder="City"
                                                        />
                                                        {errors.city && <span className="text-xs text-red-600 mt-1">{errors.city}</span>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                                            State <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            id="state"
                                                            value="Telangana"
                                                            disabled
                                                            className="pl-3 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                                                            placeholder="State"
                                                        />
                                                        {errors.state && <span className="text-xs text-red-600 mt-1">{errors.state}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                        <div className="mt-8 flex justify-center gap-3">
                                        <button
                                            type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-semibold text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition shadow-lg"
                                            onClick={handleOrderNow}
                                        >
                                            Place Order (Cash on Delivery)
                                        </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition shadow-lg"
                                                onClick={closeModal}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}