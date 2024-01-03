import Header from "./Header"
import Footer from "./Footer"
import Home from "./pages/home"
import Login from "./pages/login"
import Account from "./pages/account"
import './index.css'
import {auth} from "./firebase-config"
import { onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";

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
  let component

  switch (window.location.pathname) {
    case "/": {
      component = <Home />;
      break
    }
    case "/login": {
      if(isLoggedIn){
        window.location.pathname = '/';
        component = <Home />;
      break
      } else{
        component = <Login />;
        break
      }
      
    }
    case "/account": {
      component = <Account />;
      break
    }
    default:{
      component = <Home />;
      window.location.pathname = '/';
      break
    }
  }

  return (
    <div id='site'>
      <Header isLoggedIn={isLoggedIn} />
      {component}
      <Footer />
    </div>
  )
}

export default App
