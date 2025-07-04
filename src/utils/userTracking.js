import { doc, updateDoc, getDoc, setDoc, increment } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';

// Track user page visit
export const trackUserVisit = async (userId) => {
    if (!userId) return;
    
    try {
        const userRef = doc(fireDB, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            // Update existing user data
            await updateDoc(userRef, {
                pageVisits: increment(1),
                lastVisit: new Date().toLocaleString(),
                isActive: true
            });
        }
    } catch (error) {
        console.error('Error tracking user visit:', error);
    }
};

// Update user order data
export const updateUserOrderData = async (userId, orderAmount) => {
    if (!userId) return;
    
    try {
        const userRef = doc(fireDB, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            await updateDoc(userRef, {
                totalOrders: increment(1),
                totalSpent: increment(orderAmount),
                lastOrderDate: new Date().toLocaleString()
            });
        } else {
            await setDoc(userRef, {
                totalOrders: 1,
                totalSpent: orderAmount,
                lastOrderDate: new Date().toLocaleString(),
                pageVisits: 0,
                isActive: true,
                createdAt: new Date().toLocaleString()
            });
        }
    } catch (error) {
        console.error('Error updating user order data:', error);
    }
};

// Update user profile data
export const updateUserProfile = async (userId, userData) => {
    if (!userId) return;
    
    try {
        const userRef = doc(fireDB, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        const updateData = {
            ...userData,
            updatedAt: new Date().toLocaleString()
        };
        
        if (userDoc.exists()) {
            await updateDoc(userRef, updateData);
        } else {
            await setDoc(userRef, {
                ...updateData,
                pageVisits: 0,
                totalOrders: 0,
                totalSpent: 0,
                isActive: true,
                createdAt: new Date().toLocaleString()
            });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
};

// Get user analytics
export const getUserAnalytics = async (userId) => {
    if (!userId) return null;
    
    try {
        const userRef = doc(fireDB, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user analytics:', error);
        return null;
    }
}; 