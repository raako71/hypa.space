import { Auth } from "../auth";
import { auth } from "../firebase-config"
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import React, { useState } from 'react';

let actionCode;

document.addEventListener('DOMContentLoaded', () => {
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

    // Configure the Firebase SDK.
    // This is the minimum configuration required for the API to be used.
    const config = {
        'apiKey': "apiKey" // Copy this key from the web initialization
        // snippet found in the Firebase console.
    };

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
}, false);

function handleResetPassword(auth, actionCode, continueUrl, lang) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.

    // Verify the password reset code is valid.
    verifyPasswordResetCode(auth, actionCode).then((email) => {
        const accountEmail = email;

        // TODO: Show the reset screen with the user's email and ask the user for
        // the new password.
        const newPassword = "...";

        // Save the new password.
        console.log("ready for new password.")

    }).catch((error) => {
        console.error(error);
        // Invalid or expired action code. Ask user to try to reset the password
        // again.
    });
}

export default function Login() {

    window.addEventListener('itemCreated', () => {
        let retrievedVariable = localStorage.getItem('password2');
        confirmPasswordReset(auth, actionCode, retrievedVariable).then((resp) => {
            console.log("Password Changed");
            localStorage.removeItem('password2');
            retrievedVariable = 0;
            setDefaultDiv(false);
            setPasswordSuccessDiv(true);
        }).catch((error) => {
            console.error("Password change failed");
            console.error(error);
        });
    });
    const [defaultDiv, setDefaultDiv] = useState(true);
    const [passwordSuccessDiv, setPasswordSuccessDiv] = useState(false);

    return (
        <>
            <div className="article">
                <h1>Login</h1>
                {defaultDiv && (
                    <Auth />
                )}
                {passwordSuccessDiv && (
                <h1>Password Changed</h1>
                )}
            </div>
        </>
    )
}