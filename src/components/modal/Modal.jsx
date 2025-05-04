import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { fireDB } from '../../firebase/FirebaseConfig'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { clearCart } from '../../redux/cartSlice'

export default function Modal({ name, address, pincode, phoneNumber, setName, setAddress, setPincode, setPhoneNumber, cartItems = [], totalAmount }) {
    const [isOpen, setIsOpen] = useState(false)
    const dispatch = useDispatch()

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    const handleOrderNow = async () => {
        if (name === "" || address === "" || pincode === "" || phoneNumber === "") {
            return toast.error("All fields are required", {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            })
        }

        const orderInfo = {
            cartItems: cartItems.map(item => ({
                title: item.title,
                price: item.price,
                description: item.description,
                imageUrl: item.imageUrl,
                qunatity: item.quantity
            })),
            addressInfo: {
                name,
                address,
                pincode,
                phoneNumber,
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
            email: JSON.parse(localStorage.getItem("user"))?.user?.email,
            userid: JSON.parse(localStorage.getItem("user"))?.user?.uid,
            paymentMethod: "Cash on Delivery",
            status: "Pending",
            totalAmount: totalAmount
        }

        try {
            const orderRef = collection(fireDB, 'orders')
            await addDoc(orderRef, orderInfo)
            
            // Clear the cart after successful order
            dispatch(clearCart())
            
            // Clear the form fields
            setName("")
            setAddress("")
            setPincode("")
            setPhoneNumber("")
            
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

                    <div className="fixed inset-0 overflow-y-auto">
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all bg-white">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Complete Your Order
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <form className="space-y-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    id="address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    id="pincode"
                                                    value={pincode}
                                                    onChange={(e) => setPincode(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    id="phoneNumber"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </form>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                            onClick={handleOrderNow}
                                        >
                                            Place Order (Cash on Delivery)
                                        </button>
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