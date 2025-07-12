import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fireDB } from '../../../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { Clock, IndianRupee, Save, AlertCircle, CheckCircle } from 'lucide-react';

const Settings = () => {
    const [deliveryCharges, setDeliveryCharges] = useState('');
    const [deliveryChargesLoading, setDeliveryChargesLoading] = useState(false);
    const [deliveryChargesSaved, setDeliveryChargesSaved] = useState(false);
    const deliveryChargesRef = useRef(null);
    
    const [timingSettings, setTimingSettings] = useState({
        orderStartTime: '08:00',
        orderEndTime: '22:00',
        lateOrderCutoffTime: '21:00',
        deliveryCutoffTime: '22:30',
        defaultDeliveryTime: '12:00',
        orderDisplayDuration: '24',
    });
    const [timingLoading, setTimingLoading] = useState(false);
    const [timingSaved, setTimingSaved] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch delivery charges
                const chargesDoc = await getDoc(doc(fireDB, 'settings', 'deliveryCharges'));
                if (chargesDoc.exists()) {
                    deliveryChargesRef.current = Number(chargesDoc.data().value) || 0;
                    setDeliveryCharges(chargesDoc.data().value?.toString() || '');
                }

                // Fetch timing settings
                const timingDoc = await getDoc(doc(fireDB, 'settings', 'timing'));
                if (timingDoc.exists()) {
                    setTimingSettings(prev => ({
                        ...prev,
                        ...timingDoc.data()
                    }));
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
                toast.error('Failed to load settings');
            }
        };
        fetchSettings();
    }, []);

    const handleSaveDeliveryCharges = async () => {
        setDeliveryChargesLoading(true);
        try {
            const docRef = doc(fireDB, 'settings', 'deliveryCharges');
            await setDoc(docRef, { value: Number(deliveryCharges) });
            toast.success('Delivery charges updated!');
            setDeliveryChargesSaved(true);
            setTimeout(() => setDeliveryChargesSaved(false), 2000);
        } catch (err) {
            toast.error('Failed to update delivery charges');
        } finally {
            setDeliveryChargesLoading(false);
        }
    };

    const handleSaveTimingSettings = async () => {
        setTimingLoading(true);
        try {
            const docRef = doc(fireDB, 'settings', 'timing');
            await setDoc(docRef, timingSettings);
            toast.success('Timing settings updated!');
            setTimingSaved(true);
            setTimeout(() => setTimingSaved(false), 2000);
        } catch (err) {
            toast.error('Failed to update timing settings');
        } finally {
            setTimingLoading(false);
        }
    };

    const handleTimingChange = (key, value) => {
        setTimingSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
                <h2 className="text-2xl font-bold text-green-800 mb-2">Settings</h2>
                <p className="text-gray-600">Configure your store's delivery and timing settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Delivery Charges Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                            <IndianRupee className="w-5 h-5" />
                            Delivery Charges
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                    <input
                        type="number"
                        min="0"
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                        placeholder="Enter charges (₹)"
                        value={deliveryCharges}
                        onChange={e => setDeliveryCharges(e.target.value)}
                        disabled={deliveryChargesLoading}
                    />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {deliveryChargesSaved && <CheckCircle className="w-5 h-5 text-green-500" />}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-gray-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Applied to all orders at checkout
                                </div>
                    <button
                        onClick={handleSaveDeliveryCharges}
                                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                        disabled={deliveryChargesLoading}
                    >
                                    <Save className="w-4 h-4" />
                        {deliveryChargesLoading ? 'Saving...' : 'Save'}
                    </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timing Settings Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Timing Settings
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Order Window */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Order Window</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                                            value={timingSettings.orderStartTime}
                                            onChange={(e) => handleTimingChange('orderStartTime', e.target.value)}
                                            disabled={timingLoading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                                            value={timingSettings.orderEndTime}
                                            onChange={(e) => handleTimingChange('orderEndTime', e.target.value)}
                                            disabled={timingLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cutoff Times */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Cutoff Times</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Late Order Cutoff</label>
                                        <input
                                            type="time"
                                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                                            value={timingSettings.lateOrderCutoffTime}
                                            onChange={(e) => handleTimingChange('lateOrderCutoffTime', e.target.value)}
                                            disabled={timingLoading}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Orders after this time will be delivered with next day's harvest</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Delivery Schedule Cutoff</label>
                                        <input
                                            type="time"
                                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                                            value={timingSettings.deliveryCutoffTime}
                                            onChange={(e) => handleTimingChange('deliveryCutoffTime', e.target.value)}
                                            disabled={timingLoading}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Orders after this will be scheduled for day after tomorrow</div>
                                    </div>
                                </div>
                            </div>

                            {/* Default Delivery Time */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Default Delivery Time</h4>
                                <input
                                    type="time"
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                                    value={timingSettings.defaultDeliveryTime}
                                    onChange={(e) => handleTimingChange('defaultDeliveryTime', e.target.value)}
                                    disabled={timingLoading}
                                />
                                <div className="text-xs text-gray-500 mt-1">Standard delivery time for all orders</div>
                            </div>

                            {/* Order Display Duration */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Order Display Duration</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="168"
                                        className="w-24 border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all outline-none"
                                        value={timingSettings.orderDisplayDuration}
                                        onChange={(e) => handleTimingChange('orderDisplayDuration', e.target.value)}
                                        disabled={timingLoading}
                                    />
                                    <span className="text-gray-600">hours</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">How long to display completed/cancelled orders</div>
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="text-gray-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    All times are in 24-hour format
                                </div>
                                <button
                                    onClick={handleSaveTimingSettings}
                                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                                    disabled={timingLoading}
                                >
                                    <Save className="w-4 h-4" />
                                    {timingLoading ? 'Saving...' : 'Save'}
                                    {timingSaved && <CheckCircle className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 