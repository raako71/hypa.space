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
      // eslint-disable-next-line no-unused-vars
      const decodedToken = await admin.auth().verifyIdToken(idToken);
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
      if (docSnapshot.exists && docSnapshot.data()[username]) {
        res.status(409).send("Username already exists");
        return;
      }
      if (!userID) {
        res.status(500).send("invalid userID");
        console.error("No userID Sent");
        return;
      }
      // Write the validated username to Firestore
      await userDocRef.update({
        [usernameL]: userID,
        // Add other fields if needed
      });

      // Get existing username from user document
      const userDocRef2 = admin.firestore().collection("users").doc(userID);
      const docSnapshot2 = await userDocRef2.get();
      let existingUsername;
      if (docSnapshot2.exists) {
        existingUsername = docSnapshot2.data().username;
        await userDocRef.update({
          [existingUsername]: admin.firestore.FieldValue.delete(),
        });
        await userDocRef2.update({
          username: usernameL,
        });
      } else {
        await userDocRef2.set({
          username: usernameL,
        });
        console.error("Had to create user document");
      }


      res.status(200).send("Username successfully added to Firestore");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  });
});

exports.securedFunction = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const idToken = req.headers.authorization ?
        req.headers.authorization.split("Bearer ")[1] : undefined;

      if (!idToken) {
        res.status(403).send("Unauthorized");
        return;
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      console.log("uid =", uid);
      res.status(200).send("Authenticated and authorized!");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
  const {uid, email} = user;

  try {
    await admin.firestore().collection("users").doc(uid).set({
      FirstName: null,
      LastName: null,
      Username: null,
      email: email || null,
      // Add any additional user data you want to store upon creation
    });
    console.log("User document created for UID:", uid);
  } catch (error) {
    console.error("Error creating user document:", error);
  }
});

exports.deleteUserDocument = functions.auth.user().onDelete(async (user) => {
  const {uid} = user;

  try {
    await admin.firestore().collection("users").doc(uid).delete();
    console.log("User document deleted for UID:", uid);
  } catch (error) {
    console.error("Error deleting user document:", error);
  }
});
