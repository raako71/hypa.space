import { useEffect, useState } from 'react';
import {  onAuthStateChanged, sendEmailVerification
} from 'firebase/auth';
import { auth, db } from "../firebase-config"
import "../checkbox.css"
import { doc, getDoc } from 'firebase/firestore/lite';
import { useNavigate } from 'react-router-dom';

const actionCodeSettings = {
  url: 'http://localhost:5173/account',
  handleCodeInApp: true,
};



export default function Account() {

  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("not set");
  const [userVer, setUserVer] = useState(null);
  const [verifyLink, showVerify] = useState(false);
  const [emailSent, showEmailSent] = useState(false);
  const [usernameDiv, showusernameDiv] = useState(true);
  const [UpdateUsernameDiv, showUpdateUsernameDiv] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [UpdatingUsernameDiv, UpdatingUsernameDivFunc] = useState(false);
  const [updatingText, updatingTextFunc] = useState(null);

  const showEmailSentFunction = () => {
    showEmailSent(true);
  };

  const navigate = useNavigate();

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
        //setUserName(user.displayName);
        setUserVer(user.emailVerified);
        if (!user.emailVerified) {
          showVerify(true); // Show verification UI
        } else {
          showVerify(false); // Hide verification UI
        }
        // Get the username from the Firestore /users/{userID} path
    const userID = user.uid;
    // Assuming you have a reference to the user's document
    const userDocRef = doc(db, 'users', userID);
    getDoc(userDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          // Access the username field from the document data
          const username = docSnapshot.data().username;
          if(username != null) setUserName(username);
        } else {
          console.log('No such document!');
        }
      })
      .catch((error) => {
      console.log('Error getting document:', error);
    });
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
        navigate('/login');
      }
    });

    return () => {
      unsubscribe(); // Cleanup the listener on component unmount
    };
  }, [userName,navigate]);

  const updateUsernamelink = async () => {
    showusernameDiv(false);
    showUpdateUsernameDiv(true);
  };

  const updateUsernameFunc = async (e) => {
    e.preventDefault(); // Prevent the default behavior of the link click
    const newUsernameInput = document.getElementById('newUsername');
    const newUsername = newUsernameInput.value;

    showusernameDiv(false);
    showUpdateUsernameDiv(false);

    UpdatingUsernameDivFunc(true);
    updatingTextFunc("Updating Username to: " + newUsername);
    try {
      const user = auth.currentUser; // Retrieve the current authenticated user
      if (!user) {
          console.error('No user is currently signed in');
          // Handle the case when no user is signed in
          return;
      }
      const idToken = await user.getIdToken(); // Get the ID token of the current user
      const response = await fetch('https://us-central1-hypa-space.cloudfunctions.net/writeUsernameToFirestore', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}` // Include the ID token in the Authorization header
          },
          body: JSON.stringify({ username: newUsername, userID: user.uid })
      });
      let data;
      if (response.ok) {
          data = await response.text();
          // Process the response data from your secured function
          console.log('Response from secured function:', data);
          // Perform other actions based on the response
          showusernameDiv(true);
    showUpdateUsernameDiv(false);
    UpdatingUsernameDivFunc(false);
    setUserName(newUsername);
      } else {
        data = await response.text();
          // Process the response data from your secured function
          console.error('Failed to call secured function:', data);
          showusernameDiv(true);
          UpdatingUsernameDivFunc(true);
          updatingTextFunc("error: " + data);
          // Handle the case where the request to the secured function fails
      }
  } catch (error) {
    showusernameDiv(true);
    UpdatingUsernameDivFunc(true);
    updatingTextFunc(error);
    console.error('Error:', error);
      // Handle other potential errors
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
        {UpdatingUsernameDiv && (
          <p style={{ color: 'red' }}>{updatingText}</p>
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