import Header from "./Header"
import Footer from "./Footer"
import Home from "./pages/home"
import Login from "./pages/login"
import Terms from "./pages/terms"
import Account from "./pages/account"
import NewProd from "./pages/newProduct"
import Search from "./pages/search"
import './index.css'
import { auth } from "./firebase-config"
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProdBox from "./pages/productBox"
import Products from "./pages/products"



export const domain = 'http://localhost:5173'; // Replace with your domain

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn); // Update isLoggedIn based on user existence
      localStorage.setItem('isLoggedIn', loggedIn.toString()); // Store in localStorage
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const queryParameters = new URLSearchParams(window.location.search)
  const productName = queryParameters.get("productName")


  return (
    <Router>
      <div id='site'>
        <Header isLoggedIn={isLoggedIn} />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/search" element={<Search />} />
          <Route path="/login"
            element={isLoggedIn ? <Navigate to="/" /> : <Login />}
          />
          <Route path="/newProduct"
            element={isLoggedIn ? <NewProd /> : <Navigate to="/" />}
          />
          <Route path="/account"
            element={<Account />}
          />
          <Route path="/products"
            element={<Products />}
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/product" element={<ProdBox productNameUserID={productName} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
