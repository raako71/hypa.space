import { useEffect, useState } from 'react';
import {
  onAuthStateChanged, sendEmailVerification, 
  updateProfile
} from 'firebase/auth';
import { auth } from "../firebase-config"
import "../checkbox.css"

const actionCodeSettings = {
  url: 'http://localhost:5173/account',
  handleCodeInApp: true,
};



export default function Account() {



  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userVer, setUserVer] = useState(null);
  const [verifyLink, showVerify] = useState(false);
  const [emailSent, showEmailSent] = useState(false);
  const [usernameDiv, showusernameDiv] = useState(true);
  const [UpdateUsernameDiv, showUpdateUsernameDiv] = useState(false);
  const [idToken, setIdToken] = useState(null);

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
        // Retrieve ID token
        user.getIdToken(/* forceRefresh */ true)
          .then((idToken) => {
            setIdToken(idToken);
          })
          .catch((error) => {
            console.error('Error getting ID token:', error);
          });

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

  const testAuth = async () => {
    try {
      const cloudFunctionURL = 'https://us-central1-hypa-space.cloudfunctions.net/securedFunction';
      const response = await fetch(cloudFunctionURL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      console.log('Response from securedFunction:', response); // Log the response
      // Attempt to parse the response as JSON
      const data = await response.text();
      console.log('Parsed JSON data:', data); // Log the parsed data
      // Handle the response data if needed
      // ...
    } catch (error) {
      console.error('Error testing authentication:', error);
      // Display an error message or take appropriate action
    }
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
        <p><a href="#" onClick={testAuth}>check auth</a></p>
      </div>
    </>
  )
}