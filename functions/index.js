const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({origin: true});

exports.writeUsernameToFirestore = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Verify user authentication
      const {authorization} = req.headers;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        res.status(403).send("Unauthorized");
        return;
      }
      const idToken = authorization.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;
      const {username, userID} = req.body;
      const usernameL = username.toLowerCase(); // Convert to lowercase
      // Validation: Check if the username matches the allowed pattern
      const validUsernameRegex = /^[a-z0-9_-]+$/;
      if (!validUsernameRegex.test(usernameL)) {
        res.status(400).send("Invalid username format");
        return;
      }
      // Check if the username already exists in Firestore
      const userDocRef = admin.firestore().collection("users").doc("allusers");
      const docSnapshot = await userDocRef.get();
      if (docSnapshot.exists && docSnapshot.data()[usernameL]) {
        res.status(409).send("Username already exists");
        return;
      }
      if (!userID) {
        res.status(500).send("invalid userID");
        console.error("No userID Sent");
        return;
      }

      // Get existing username from user document
      const userDocRef2 = admin.firestore().collection("users").doc(userID);
      const docSnapshot2 = await userDocRef2.get();
      let existingUsername;
      if (docSnapshot2.exists) {
        if ("username" in docSnapshot2.data()) {
          existingUsername = docSnapshot2.data().username;
          if (userID !== docSnapshot.data()[existingUsername]) {
            console.error("username mismatch in firestore. " +
           existingUsername + "doesn't match up.");
            res.status(500).send("Well thats weird.");
            return;
          }
        } else {
          console.error("username deleted from personal document.");
          res.status(500).send("Well thats weird.");
          return;
        }
        await userDocRef.update({
          [existingUsername]: admin.firestore.FieldValue.delete(),
        });
        await userDocRef2.update({
          username: usernameL,
        });
      } else {
        await userDocRef2.set({
          username: usernameL,
          email: email, // Add email to the document
        });
        console.log("Had to create user document");
      }
      // Write the validated username to Firestore
      await userDocRef.update({
        [usernameL]: userID,
      // Add other fields if needed
      });
      res.status(200).send("Username successfully added to Firestore");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  });
});

exports.deleteUserDocument = functions.auth.user().onDelete(async (user) => {
  const {uid} = user;

  try {
    const userDocRef = admin.firestore().collection("users").doc("allusers");
    const userDocRef2 = admin.firestore().collection("users").doc(uid);
    const docSnapshot2 = await userDocRef2.get();
    const existingUsername = docSnapshot2.data().username;
    await userDocRef.update({
      [existingUsername]: admin.firestore.FieldValue.delete(),
    });
    await admin.firestore().collection("users").doc(uid).delete();
    console.log("User data deleted for UID:", uid);
  } catch (error) {
    console.error("Error deleting user data:", error);
  }
});
