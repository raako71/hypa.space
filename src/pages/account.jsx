import { useEffect, useState } from 'react';
import {
  onAuthStateChanged, sendEmailVerification
} from 'firebase/auth';
import { auth, db } from "../firebase-config"
import "../checkbox.css"
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Styles for react-phone-number-input


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
  const [UpdatingUsernameDiv, UpdatingUsernameDivFunc] = useState(false);
  const [updatingText, updatingTextFunc] = useState(null);
  const [usernameValidated, usernameValidFunc] = useState(false);
  const [sellerEnabled, sellerEnabledFunc] = useState(false);
  const [sellerEnabledDiv, sellerEnabledDivFunc] = useState(false);
  const [userID, setUserID] = useState(null);
  const [sellerUpdate, sellerUpdateFunc] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [showValidateMessage, sellerValidateMsg] = useState("add a username above to enable.");
  const [telegramEnabled, enableTelegram] = useState(false);
  const [wspEnabled, enableWSP] = useState(false);
  const [storeName, setStoreName] = useState("");



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
        setUserID(userID);
        // Assuming you have a reference to the user's document
        const userDocRef = doc(db, 'users', userID);
        getDoc(userDocRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              // Access the username field from the document data
              const username = docSnapshot.data().username;
              const sellerEnabled = docSnapshot.data().sellerEnabled
              sellerEnabledFunc(sellerEnabled);
              sellerEnabledDivFunc(sellerEnabled);
              if (username != null) {
                setUserName(username);
                usernameValidFunc(true);
              }
              const phoneNumber = docSnapshot.data().phoneNumber;
              if (phoneNumber != null) {
                setNewPhoneNumber(phoneNumber);
              }
              const telegramEnabled = docSnapshot.data().telegram;
              if (telegramEnabled != null) {
                enableTelegram(telegramEnabled);
              }
              const wspEnabled = docSnapshot.data().whatsApp;
              if (wspEnabled != null) {
                enableWSP(wspEnabled);
              }
              const storeName = docSnapshot.data().storeName;
              if (storeName != null) {
                setStoreName(storeName);
              }

            } else {
              console.log('No such document!');
            }
          })
          .catch((error) => {
            console.log('Error getting document:', error);
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
  }, [userName, navigate, userID, sellerEnabled, newPhoneNumber]);

  const updateUsernamelink = async () => {
    showusernameDiv(false);
    showUpdateUsernameDiv(true);
  };

  const updateSellerDetails = () => {
    sellerEnabledDivFunc(false);
    sellerUpdateFunc(true);
    usernameValidFunc(false);
    sellerValidateMsg("enabled");
  };

  const cancelUpdate = () => {
    sellerEnabledDivFunc(true);
    sellerUpdateFunc(false);
    usernameValidFunc(true);
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

  const enableSeller = async (userID, sellerEnabled) => {
    const userDocRef = doc(db, 'users', userID);
    try {
      // Update the sellerEnabled field in Firestore
      await updateDoc(userDocRef, {
        sellerEnabled: !sellerEnabled // Toggle the value
      });
      // Update the state with the new value
      sellerEnabledDivFunc(!sellerEnabled);
      sellerEnabledFunc(!sellerEnabled);
    } catch (error) {
      console.error('Error updating user: ', error);
    }
  };







  const handleSaveDetails = async (userID) => {
    const userDocRef = doc(db, 'users', userID);

    try {
      // Update the address and phone number fields in Firestore
      await updateDoc(userDocRef, {
        address: newAddress,
        phoneNumber: newPhoneNumber,
        telegram: telegramEnabled,
        whatsApp: wspEnabled,
        storeName: storeName,
      });
      sellerEnabledDivFunc(true);
      sellerUpdateFunc(false);
      usernameValidFunc(true);
    } catch (error) {
      console.error('Error updating user details: ', error);
    }
  };

  const enableTelegramFunc = () => {
    enableTelegram(!telegramEnabled);
  };

  const enableWSPFunc = () => {
    enableWSP(!wspEnabled);
  };

  function filterString(input) {
    const pattern = /[a-zA-Z0-9\s\-_.]+/g;
    const filteredString = input.match(pattern)?.join('') || '';
    return filteredString;
  }

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const filteredValue = filterString(inputValue);
    if (filteredValue.length > 20) {
      filteredValue = filteredValue.slice(0, 20);
    }
    setStoreName(filteredValue);
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
        <div className='seller'>
          <p>seller mode:&nbsp;
            {!usernameValidated && (
              <>
                {showValidateMessage}
              </>)}
            {usernameValidated && (
              <label className="switch">
                <input type="checkbox"
                  checked={sellerEnabled}
                  onChange={() => enableSeller(userID, sellerEnabled)} />
                <span className="slider round"></span>
              </label>
            )}
          </p>
          {sellerEnabledDiv && (
            <>
              <p>Store Name: {storeName}</p>
              <p>Address:</p>
              <p>Seller Phone number: <a target='_blank' rel="noreferrer" href={`tel:${newPhoneNumber}`}>{newPhoneNumber}</a></p>
              {wspEnabled && (<p><a target='_blank' rel="noreferrer" href={`https://wa.me/${newPhoneNumber}`}>WhatsApp link</a></p>)}
              {telegramEnabled && (<p><a target='_blank' rel="noreferrer" href={`https://t.me/${newPhoneNumber}`}>Telegram Link</a></p>)}

              <p><a href="#" onClick={updateSellerDetails}>Update</a></p>
            </>
          )}
          {sellerUpdate && (
            <>
              <div>
                <p>Store Name:&nbsp;
                  <input
                    type="text"
                    value={storeName}
                    onChange={handleInputChange} />
                </p>

              </div>
              <div>
                <p>Address: //div function.</p>
              </div>
              <div>
                <p>Seller Phone number:</p>
                {/* React-phone-number-input component for the phone number field */}
                <PhoneInput
                  value={newPhoneNumber}
                  onChange={setNewPhoneNumber}
                  defaultCountry="US" // Set default country if needed
                />
                <p>enable WhatsApp link
                  <input type="checkbox"
                    checked={wspEnabled}
                    onChange={enableWSPFunc} />
                </p>
                <p>enable Telegram link
                  <input type="checkbox"
                    checked={telegramEnabled}
                    onChange={enableTelegramFunc} />
                </p>
              </div>
              <div>
                <button onClick={() => handleSaveDetails(userID)}>
                  Save new details
                </button>&nbsp;
                <button onClick={cancelUpdate}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div >
    </>
  )
}