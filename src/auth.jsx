import { auth } from "./firebase-config"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendSignInLinkToEmail } from "firebase/auth";
import { useState, useEffect } from "react";

export const Auth = () => {

    const actionCodeSettings = {
        url: 'http://localhost:5173/',
        // This must be true.
        handleCodeInApp: true,
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if(passwordReset) resetPassword();
            else if (loginDiv) signIn(); // Call your signIn function here
            else createAccount();
        }
    };

    // Function to validate email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to handle email change
    function handleEmailChange(e) {
        const newEmail = e.target.value;
        if (newEmail.length <= 255) { // 255 is a common limit for email length
            setEmail(newEmail);
            setIsValidEmail(validateEmail(newEmail)); // Validate the new email on change
        }
    }

    function handlePasswordChange(e) {
        const { name, value } = e.target;
        if (value.length <= 255) {
            if (name === "password1") {
                setPassword1(value);
                if (value.length > 5) setIsValidPassword(true);
                else setIsValidPassword(false);
            }
            else {
                setPassword2(value);
            }
        } else {
            if (name === "password") setIsValidPassword(false);
            else setIsValidPassword2(false);
        }
    }



    const resetPassword = async () => {
        if (isValidEmail) {
            sendSignInLinkToEmail(auth, email, actionCodeSettings)
                .then(() => {
                    // The link was successfully sent. Inform the user.
                    // Save the email locally so you don't need to ask the user for it again
                    // if they open the link on the same device.
                    window.localStorage.setItem('emailForSignIn', email);
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.error(error.code);
                    const errorMessage = error.message;
                    setText(error.message);
                    // ...
                });
        }
    };


    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidPassword2, setIsValidPassword2] = useState(true);
    const [errorText, setText] = useState(' ');
    const [loginDiv, setloginDiv] = useState(true);
    const [passwordReset, setPasswordReset] = useState(false);

    useEffect(() => {
        if (!loginDiv) {
            if (password2 === password1) {
                setIsValidPassword2(password2.length > 5);
                setText()
            } else {
                setIsValidPassword2(false);
                setText("Passwords must match")
            }
        }
    }, [password1, password2]);

    const signIn = async () => {
        if (isValidPassword && isValidEmail) {
            try {
                await signInWithEmailAndPassword(auth, email, password1);
            } catch (err) {
                if (err.code === 'auth/invalid-credential') {
                    setText("Invalid credentials");
                } else {
                    console.error(err);
                    setText(err.code);
                }
            }
        }
    };

    const createAccount = async () => {
        if (isValidPassword2 && isValidEmail) {
            try {
                await createUserWithEmailAndPassword(auth, email, password1);
            } catch (err) {
                if (err.code === 'auth/invalid-credential') {
                    setText("Invalid credentials");
                } else {
                    console.error(err);
                    setText("Invalid credentials");
                }
            }
        }
    };

    const showCreateAccount = () => {
        setloginDiv(!loginDiv); // Toggles the value of showDiv (true/false)
    };

    const showPasswordReset = () => {
        setPasswordReset(!passwordReset); // Toggles the value of showDiv (true/false)
    };

    return (
        <div className="middle">
            <input placeholder="email" value={email} onChange={handleEmailChange} onKeyDown={handleKeyPress}/>
            {isValidEmail ? null : <span style={{ color: 'red' }}>*</span>}
            <br />
            {!passwordReset && (
                <div>
                    <input placeholder="Password" type="password" name="password1" value={password1} onChange={handlePasswordChange} onKeyDown={handleKeyPress} />
                    {isValidPassword ? null : <span style={{ color: 'red' }}>*</span>}
                    {loginDiv && (
                        <div><button onClick={signIn}>Sign In</button>
                            <p><a onClick={showCreateAccount} href="#">New Account</a> / <a href="#" onClick={showPasswordReset}>Forgot Password</a></p>
                        </div>)}
                    {!loginDiv && (
                        <div>
                            <input placeholder="Password" type="password" name="password2" value={password2} onChange={handlePasswordChange} onKeyDown={handleKeyPress} />
                            {isValidPassword2 ? null : <span style={{ color: 'red' }}>*</span>}
                            <br />
                            <button onClick={createAccount}>Create account</button>
                        </div>)}
                </div>)}
            {passwordReset && (
                <button onClick={resetPassword}>Reset password</button>
            )}
            <p style={{ color: 'red' }}>{errorText}</p>
        </div>
    );
};