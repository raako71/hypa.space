import Header from "./components/Header"
import Footer from "./Footer"
import Home from "./pages/home"
import Login from "./pages/login"
import Terms from "./pages/terms"
import Account from "./pages/account"
import NewProd from "./pages/newProduct"
import Search from "./pages/search"
import './index.css'
import PublicStore from "./pages/store"
import { auth, db } from "./firebase-config"
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Products from "./pages/products"
import ProductPage from "./pages/productPage"
import { doc, getDoc } from 'firebase/firestore/lite';
import DeletePage from "./pages/delete"



function App() {
  const domain = location.origin;
  const [existingData, setExistingData] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const loggedIn = !!user;

      if (user) {
        const userID = user.uid;
        setUserID(userID);
        const userDocRefVar = doc(db, 'users', userID);
        const userDocSnapshotVar = await getDoc(userDocRefVar);
        const existingDataVar = userDocSnapshotVar.data();
        setExistingData(existingDataVar);
        setIsLoggedIn(loggedIn); // Update isLoggedIn based on user existence
        //console.log("logged In. userID = " + userID);
        localStorage.setItem('isLoggedIn', loggedIn.toString()); // Store in localStorage
      } else {
        setIsLoggedIn(false); // Handle user not logged in
        setUserID(null);
        //console.log("logged out. userID = " + userID);
        localStorage.setItem('isLoggedIn', 'false'); // Store in localStorage
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <Router>
      <div id='site'>
        <Header
          isLoggedIn={isLoggedIn}
          domain={domain}
        />
        <Routes>
          <Route path="/" element={<Home domain={domain} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login"
            element={isLoggedIn ? <Navigate to="/" /> : <Login />}
          />
          <Route path="/newProduct"
            element={isLoggedIn ? <NewProd
              existingData={existingData}
              userID={userID}
            /> : <Navigate to="/" />}
          />
          <Route path="/account"
            element={<Account />}
          />
          <Route path="/products"
            element={<Products
              existingData={existingData}
              userID={userID}
            />}
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/delete"
            element={<DeletePage
              existingData={existingData}
              userID={userID}
            />} />
          <Route path="/product" element={<ProductPage
            userID={userID || ''}
            domain={domain}
          />} />
          <Route path="/store/:userName" element={<PublicStore 
          SessionID={userID}
          />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
