import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, sendEmailVerification, applyActionCode } from 'firebase/auth';
import { auth } from "../firebase-config"

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

  const showEmailSentFunction = () => {
    showEmailSent(true);
  };

  const sendEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      showEmailSentFunction();
      showVerify("");
    } catch (err) {
      console.error(err);
    }
  }

  let userVerificationText = userVer ? "Yes" : "No";

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get the email
        setUserEmail(user.email);
        setUserName(user.displayName);
        setUserVer(user.emailVerified);
        if (!userVer) {
          //showVerify(1);
        } else showVerify("");
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
        <p>username: {userName}</p>
        <p>email: {userEmail}</p>
      </div>
    </>
  )
}