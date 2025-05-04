import React, { useEffect, useState } from 'react'
import MyContext from './myContext';
import { fireDB as fireDb } from '../../firebase/FirebaseConfig';
import { Timestamp, addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { doc, deleteDoc, setDoc, getDocs } from "firebase/firestore";



function MyState(props) {
  const [mode, setMode] = useState('light');  
  const [loading, setLoading] = useState(false); 

  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
      document.body.style.backgroundColor = 'rgb(17, 24, 39)';
    }
    else {
      setMode('light');
      document.body.style.backgroundColor = 'white';
    }
  }

  const [products, setProducts] = useState({
    title: null,
    price: null,
    actualprice: null,
    imageUrl: null,
    category: null,
    description: null,
    time: Timestamp.now(),
    date: new Date().toLocaleString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    )

  })

  // ********************** Add Product Section  **********************
  const addProduct = async () => {
    const requiredFields = ['title', 'price', 'actualprice', 'imageUrl', 'category', 'description'];
    
    // Validate that all required fields are filled
    for (const field of requiredFields) {
        if (!products[field]) {
            return toast.error(`Please fill all fields`);
        }
    }

    const productRef = collection(fireDb, "products");
    setLoading(true);
    
    try {
        await addDoc(productRef, {
            ...products,
            time: Timestamp.now(),
            date: new Date().toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }),
        });
        toast.success("Product added successfully");
        
        // Delay to show the toast before navigating
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 800);
        
        getProductData(); // Call this to refresh product data
        closeModal(); // Close the modal after adding the product

    } catch (error) {
        console.log(error);
        toast.error("Failed to add product. Please try again."); // Inform the user of the error
    } finally {
        setLoading(false);
    }
    
    // Reset products state to an empty object
    setProducts({
        title: '',
        price: '',
        actualprice: '',
        imageUrl: '',
        category: '',
        description: ''
    });
};


  const [product, setProduct] = useState([]);

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
    setProducts(item)
  }
  // update product
  const updateProduct = async (item) => {
    setLoading(true)
    try {
      await setDoc(doc(fireDb, "products", products.id), products);
      toast.success("Product Updated successfully")
      setTimeout(()=>{
        window.location.href = '/dashboard'
      }, 800)
      getProductData();
      setLoading(false)
      
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
    setProducts("")
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
        usersArray.push(doc.data());
        setLoading(false)
      });
      setUser(usersArray);
      console.log(usersArray)
      setLoading(false);
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }




  useEffect(() => {
    getProductData();
    getOrderData();
    getUserData();
  }, []);
  const [searchkey, setSearchkey] = useState('')

  return (
    <MyContext.Provider value={{ 
      mode, toggleMode, loading,setLoading,
      products, setProducts,addProduct, product,edithandle,updateProduct, deleteProduct,order,user,searchkey,setSearchkey}}>
      {props.children}
    </MyContext.Provider>
  )
}

export default MyState