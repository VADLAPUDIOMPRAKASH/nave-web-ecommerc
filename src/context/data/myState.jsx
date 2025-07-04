import React, { useEffect, useState } from 'react'
import MyContext from './myContext';
import { fireDB as fireDb } from '../../firebase/FirebaseConfig';
import { Timestamp, addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { doc, deleteDoc, setDoc, getDocs, updateDoc, getDoc } from "firebase/firestore";



function MyState(props) {
  const [loading, setLoading] = useState(false); 
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  const [product, setProduct] = useState([]);

  // ********************** Add Product Section  **********************
  const addProduct = async (newProduct) => {
    const requiredFields = ['title', 'price', 'actualprice', 'imageUrl', 'category', 'description'];
    
    // Validate that all required fields are filled
    for (const field of requiredFields) {
        if (!newProduct[field]) {
            return toast.error(`Please fill all fields`);
        }
    }

    const productRef = collection(fireDb, "products");
    setLoading(true);
    
    try {
        await addDoc(productRef, {
            ...newProduct,
            time: Timestamp.now(),
            date: new Date().toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }),
        });
        toast.success("Product added successfully");
        
        // Refresh product data immediately
        getProductData();

    } catch (error) {
        console.log(error);
        toast.error("Failed to add product. Please try again."); // Inform the user of the error
    } finally {
        setLoading(false);
    }
};

  // ****** get product
  const getProductData = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(fireDb, "products"),
        orderBy("time"),
        // limit(5)
      );
      const data = onSnapshot(q, (QuerySnapshot) => {
        let productsArray = [];
        QuerySnapshot.forEach((doc) => {
          productsArray.push({ ...doc.data(), id: doc.id });
        });
        setProduct(productsArray)
        setLoading(false);
      });
      return () => data;
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
  //update and delete
  const edithandle = (item) => {
    // This function is used for editing products
    // The item will be passed to the update form
    console.log("Editing product:", item);
  }
  // update product
  const updateProduct = async (item) => {
    setLoading(true)
    try {
      console.log("Updating product with data:", item);
      
      // Use updateDoc instead of setDoc to update existing document
      const productRef = doc(fireDb, "products", item.id);
      const updateData = {
        title: item.title,
        price: parseFloat(item.price),
        category: item.category,
        description: item.description,
        weight: item.weight ? parseFloat(item.weight) : null,
        imageUrl: item.imageUrl,
        actualprice: item.actualprice || item.actualPrice,
        lastUpdated: new Date().toLocaleString()
      };
      
      console.log("Update data:", updateData);
      await updateDoc(productRef, updateData);
      
      toast.success("Product Updated successfully")
      getProductData();
      setLoading(false)
      
    } catch (error) {
      setLoading(false)
      console.log("Error updating product:", error)
      console.log("Error details:", error.code, error.message)
      toast.error("Failed to update product. Please try again.")
    }
  }

  const deleteProduct = async (item) => {
    setLoading(true);
  
    try {
      console.log("Attempting to delete product with ID:", item.id);
      await deleteDoc(doc(fireDb, "products", item.id));
      toast.success('Product deleted successfully');
      getProductData(); // Refresh the product list after deletion
    } catch (error) {
      toast.error('Product deletion failed');
      console.error("Error deleting product:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  }
  const [order, setOrder] = useState([]);

  const getOrderData = () => {
    const q = query(collection(fireDb, "orders"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersArray = [];
      querySnapshot.forEach((doc) => {
        ordersArray.push({ ...doc.data(), id: doc.id });
      });
      setOrder(ordersArray); // Update the orders state
      setLoading(false); // Set loading to false after fetching
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });
  
    // Cleanup function to unsubscribe from the listener when component unmounts
    return () => unsubscribe();
  };
  
  
  const [user, setUser] = useState([]);

  const getUserData = async () => {
    setLoading(true)
    try {
      const result = await getDocs(collection(fireDb, "users"))
      const usersArray = [];
      result.forEach((doc) => {
        const userData = doc.data();
        usersArray.push({
          ...userData,
          id: doc.id,
          // Set default values for missing fields
          pageVisits: userData.pageVisits || 0,
          totalOrders: userData.totalOrders || 0,
          totalSpent: userData.totalSpent || 0,
          phone: userData.phone || 'Not provided',
          address: userData.address || 'Not provided',
          lastVisit: userData.lastVisit || 'Never',
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt || userData.date || 'N/A'
        });
        setLoading(false)
      });
      setUser(usersArray);
      console.log('Enhanced user data:', usersArray)
      setLoading(false);
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  // Update user data with additional information
  const updateUserData = async (userId, userData) => {
    try {
      const userRef = doc(fireDb, "users", userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toLocaleString()
      });
      getUserData(); // Refresh user data
      toast.success('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Failed to update user data');
    }
  };

  // Track user activity
  const trackUserActivity = async (userId, activityType, data = {}) => {
    // Skip tracking if disabled
    if (!trackingEnabled) {
      console.log('User activity tracking is currently disabled');
      return;
    }
    try {
      const userRef = doc(fireDb, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        let updateData = {};
        switch (activityType) {
          case 'page_visit':
            updateData = {
              pageVisits: (currentData.pageVisits || 0) + 1,
              lastVisit: new Date().toLocaleString(),
              isActive: true
            };
            break;
          case 'order_placed':
            updateData = {
              totalOrders: (currentData.totalOrders || 0) + 1,
              totalSpent: (currentData.totalSpent || 0) + (data.amount || 0),
              lastOrderDate: new Date().toLocaleString()
            };
            break;
          case 'profile_update':
            updateData = {
              ...data,
              updatedAt: new Date().toLocaleString()
            };
            break;
        }
        await updateDoc(userRef, updateData);
      } // Do not create a new user if not found
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  };

  // Function to re-enable tracking (can be called from admin panel)
  const enableTracking = () => {
    setTrackingEnabled(true);
    localStorage.removeItem('trackingDisabled');
    localStorage.removeItem('trackingDisabledAt');
    console.log('User activity tracking re-enabled');
  };

  // Function to disable tracking manually
  const disableTracking = () => {
    setTrackingEnabled(false);
    localStorage.setItem('trackingDisabled', 'true');
    localStorage.setItem('trackingDisabledAt', new Date().toISOString());
    console.log('User activity tracking manually disabled');
  };

  // Check if tracking was previously disabled on app start
  useEffect(() => {
    const trackingDisabled = localStorage.getItem('trackingDisabled');
    if (trackingDisabled === 'true') {
      setTrackingEnabled(false);
      console.log('User activity tracking was previously disabled due to quota issues');
    }
  }, []);

  useEffect(() => {
    getProductData();
    getOrderData();
    getUserData();
  }, []);
  const [searchkey, setSearchkey] = useState('')

  return (
    <MyContext.Provider value={{ 
      loading, setLoading,
      addProduct, product, edithandle, updateProduct, deleteProduct, order, user, searchkey, setSearchkey,
      getUserData, updateUserData, trackUserActivity, enableTracking, disableTracking, trackingEnabled}}>
      {props.children}
    </MyContext.Provider>
  )
}

export default MyState