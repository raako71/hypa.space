import {auth} from "./firebase-config"
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
  } from "firebase/auth";
  import { useState } from "react";

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      signIn(); // Call your signIn function here
    }
  };
  
export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
          console.error(err);
        }
      };
    return (
    <div className="middle">
        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} /><br/>
        <input placeholder="Password"  type="password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyPress}/><br></br>
        <button onClick={signIn}>Sign In</button>
    </div>
    );
};