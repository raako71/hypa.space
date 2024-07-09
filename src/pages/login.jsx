import { auth } from "../firebase-config"
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendPasswordResetEmail, sendSignInLinkToEmail
} from "firebase/auth";
import PropTypes from 'prop-types';

const Login = () => {

    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidPassword2, setIsValidPassword2] = useState(true);
    const [errorText, setText] = useState(' ');
    const [newPassDiv, newPassFunc] = useState(false);
    const [emailDiv, emailDivFunc] = useState(true);
    const [passwordDiv, passwordDivFunc] = useState(true);
    const [loginDiv, loginDivFunc] = useState(true);
    const [Password2Div, Password2DivFunc] = useState(false);
    const [createAccountDiv, createAccountDivFunc] = useState(false);
    const [resetDiv, resetDivFunc] = useState(false);
    const [emailSentDiv, emailSentDivFunc] = useState(false);
    const [emailLinkDiv, emailLinkDivFunc] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const domain = location.origin;

    const actionCodeSettings = {
        url: domain,
        // This must be true.
        handleCodeInApp: true,
    };

    /*
        useEffect(() => {
            // TODO: Implement getParameterByName()
            function getParameterByName(name, url = window.location.href) {
                name = name.replace(/[\[\]]/g, '\\$&');
                const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
                const results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, ' '));
            }
    
            // Get the action to complete.
            const mode = getParameterByName('mode');
            // Get the one-time code from the query parameter.
            actionCode = getParameterByName('oobCode');
            // (Optional) Get the continue URL from the query parameter if available.
            const continueUrl = getParameterByName('continueUrl');
            // (Optional) Get the language code if available.
            const lang = getParameterByName('lang') || 'en';
            // Get the API key from the query parameter.
            const apiKey = getParameterByName('apiKey'); // Assuming apiKey is included in the link
    
            // Handle the user management action.
            switch (mode) {
                case 'resetPassword':
                    // Display reset password handler and UI.
                    handleResetPassword(auth, actionCode, continueUrl, lang);
                    //console.log("resetPassword URL recieved")
                    break;
                case 'recoverEmail':
                    // Display email recovery handler and UI.
                    handleRecoverEmail(auth, actionCode, lang);
                    break;
                case 'verifyEmail':
                    // Display email verification handler and UI.
                    handleVerifyEmail(auth, actionCode, continueUrl, lang);
                    break;
                default:
                // Error: invalid mode.
            }
        }, []);
        */

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        if (mode === 'resetPassword') {
            loginDivFunc(false);
            Password2DivFunc(true);
            emailDivFunc(false);
            newPassFunc(true);
        }
    }, []);

    function handleResetPassword(auth, actionCode) {
        console.log("handleResetPassword func");

        verifyPasswordResetCode(auth, actionCode).then((email) => {
            console.log("ready for new password. requesting email is: " + email)
            confirmPasswordReset(auth, actionCode, password2)
            .then(() => {
                console.log("Password Changed");
                        setDefaultDiv(false);
                        setPasswordSuccessDiv(true);

            }).catch((error) => {
                console.error("Password change failed");
                        console.error(error);
                        setText(error.code);
            });
        }).catch((error) => {
            console.log("verifyPasswordResetCode function error")
            console.error(error);
            // Invalid or expired action code. Ask user to try to reset the password
            // again.
        });
    }

    const saveNewPassFunc = () => {
        if (isValidPassword2) {
            console.log("updating password.");
            const urlParams = new URLSearchParams(window.location.search);
            const actionCode = urlParams.get('oobCode');
            handleResetPassword(auth, actionCode)
        }
    }

    // Function to validate email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

    const emailLoginFunction = async () => {
        if (isValidEmail) {
            sendSignInLinkToEmail(auth, email, actionCodeSettings)
                .then(() => {
                    // The link was successfully sent. Inform the user.
                    // Save the email locally so you don't need to ask the user for it again
                    // if they open the link on the same device.
                    window.localStorage.setItem('emailForSignIn', email);
                    emailSentDivFunc(true);
                    emailLinkDivFunc(false);
                })
                .catch((error) => {
                    console.error(error.code);
                    setText(error.message);
                    // ...
                });
        }
    };

    const passwordResetFunction = async () => {
        if (isValidEmail) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    emailSentDivFunc(true);
                    resetDivFunc(false);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };


    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const showNewAccount = () => {
        loginDivFunc(false);
        createAccountDivFunc(true);
        Password2DivFunc(true);
    };
    const showEmailLink = () => {
        passwordDivFunc(false);
        loginDivFunc(false);
        emailLinkDivFunc(true);
    };
    const showPasswordReset = () => {
        loginDivFunc(false);
        passwordDivFunc(false);
        resetDivFunc(true);
    };


    useEffect(() => {
        if (Password2Div) {
            if (password2 === password1) {
                setIsValidPassword2(password2.length > 5);
                setText()
            } else {
                setIsValidPassword2(false);
                setText("Passwords must match")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (isValidPassword2 && isValidEmail && isChecked) {
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (emailLinkDiv) emailLoginFunction();
            else if (loginDiv) signIn(); // Call your signIn function here
            else createAccount();
        }
    };

    // Function to handle email change
    function handleEmailChange(e) {
        const newEmail = e.target.value;
        if (newEmail.length <= 255) { // 255 is a common limit for email length
            setEmail(newEmail);
            setIsValidEmail(validateEmail(newEmail)); // Validate the new email on change
        }
    }

    const [defaultDiv, setDefaultDiv] = useState(true);
    const [passwordSuccessDiv, setPasswordSuccessDiv] = useState(false);

    return (
        <>
            <div className="article">
                <h1>Login</h1>
                {defaultDiv && (
                    <div className="middle">
                        {emailDiv && (
                            <div>
                                <input placeholder="email" value={email} onChange={handleEmailChange} onKeyDown={handleKeyPress} />
                                {isValidEmail ? null : <span style={{ color: 'red' }}>*</span>}
                                <br />
                            </div>
                        )}

                        {passwordDiv && (
                            <div>
                                <input placeholder="Password" type="password" name="password1" value={password1} onChange={handlePasswordChange} onKeyDown={handleKeyPress} />
                                {isValidPassword ? null : <span style={{ color: 'red' }}>*</span>}
                            </div>
                        )}

                        {loginDiv && (
                            <div><button onClick={signIn}>Sign In</button>
                                <p><a onClick={showNewAccount} href="#">New account</a>
                                    <br /> <a href="#" onClick={showEmailLink}>Login by email link</a>
                                    <br /> <a href="#" onClick={showPasswordReset}>Forgot password</a>
                                </p>
                            </div>)}

                        {Password2Div && (
                            <div>
                                <input placeholder="Password" type="password" name="password2" value={password2} onChange={handlePasswordChange} onKeyDown={handleKeyPress} />
                                {isValidPassword2 ? null : <span style={{ color: 'red' }}>*</span>}
                                <br />
                            </div>
                        )}

                        {createAccountDiv && (
                            <>
                                <p>
                                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                                    Agree with <a href={domain + "/terms"} target="_blank" rel="noopener noreferrer">Terms and Conditions.</a>
                                </p>
                                <button onClick={createAccount}>Create account</button>
                            </>
                        )}

                        {resetDiv && (<button onClick={passwordResetFunction}>Send password reset email link</button>)}
                        {emailLinkDiv && (<button onClick={emailLoginFunction}>Send email login link</button>)}
                        {emailSentDiv && (<p>email sent</p>)}
                        {newPassDiv && (<button onClick={saveNewPassFunc}>Save New Password</button>)}
                        <p style={{ color: 'red' }}>{errorText}</p>
                    </div >
                )}
                {passwordSuccessDiv && (
                    <h1>Password Changed</h1>
                )}
            </div>
        </>
    )
}

Login.propTypes = {
    domain: PropTypes.string,
};

export default Login