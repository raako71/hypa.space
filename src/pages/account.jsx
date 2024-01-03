import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Account(){
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in, get the email
            setUserEmail(user.email);
          } else {
            // No user signed in
            setUserEmail(null);
          }
        });
    
        return () => {
          unsubscribe(); // Cleanup the listener on component unmount
        };
      }, []);

    return (
    <>
    <div className="article">
    <h1>account</h1>
    <p>email: {userEmail}</p>
    </div>
    </>
    )
}