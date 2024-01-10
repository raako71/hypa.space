import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged, sendEmailVerification,
  applyActionCode, updateProfile
} from 'firebase/auth';
import { auth } from "../firebase-config"
import "../checkbox.css"

const actionCodeSettings = {
  url: 'http://localhost:5173/account',
  handleCodeInApp: true,
};



const applyVerification = async () => {
  // Obtain code from the user.
  await applyActionCode(auth, code);
}


export default function Account() {


  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userVer, setUserVer] = useState(null);
  const [verifyLink, showVerify] = useState(false);
  const [emailSent, showEmailSent] = useState(false);
  const [usernameDiv, showusernameDiv] = useState(true);
  const [UpdateUsernameDiv, showUpdateUsernameDiv] = useState(false);




  const showEmailSentFunction = () => {
    showEmailSent(true);
  };

  const sendEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      showEmailSentFunction();
      showVerify(false);
    } catch (err) {
      console.error(err);
    }
  }

  let userVerificationText = userVer ? "Yes." : "No.";

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get the email
        setUserEmail(user.email);
        setUserName(user.displayName);
        setUserVer(user.emailVerified);
        if (!user.emailVerified) {
          showVerify(true); // Show verification UI
        } else {
          showVerify(false); // Hide verification UI
        }
        if (user.displayName === null) {
          setUserName("unassigned");

        }
      } else {
        // No user signed in
        setUserEmail(null);
        setUserName(null);
        setUserVer(null);
      }
    });

    return () => {
      unsubscribe(); // Cleanup the listener on component unmount
    };
  }, []);

  const updateUsernamelink = async () => {
    showusernameDiv(false);
    showUpdateUsernameDiv(true);
  };

  const updateUsernameFunc = async (e) => {
    e.preventDefault(); // Prevent the default behavior of the link click
    const newUsernameInput = document.getElementById('newUsername');
    const newUsername = newUsernameInput.value;
    updateProfile(auth.currentUser, {
      displayName: newUsername
    }).then(() => {
      console.log("Username updated successfully!");
      // ...
    }).catch((error) => {
      console.error("Error updating username:", error.message);
    });
  };



  return (
    <>
      <div className="article">
        <h1>account</h1>
        <p>User verified: {userVerificationText}&nbsp;
          {verifyLink && (
            <a href='#' onClick={sendEmail}>Send verification email</a>
          )}
          {emailSent && (
            <>email sent</>
          )}
        </p>
        {usernameDiv && (
          <p>Username: {userName}. <a href="#" onClick={updateUsernamelink}>Update Username</a></p>
        )}
        {UpdateUsernameDiv && (
          <p>
            <input placeholder="New Username" id="newUsername" />
            &nbsp;&nbsp;<a href='#' onClick={updateUsernameFunc}>Save Username</a>
          </p>
        )}
        <p>email: {userEmail}</p>
        <p>seller mode:&nbsp;&nbsp;
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </p>
      </div>
    </>
  )
}