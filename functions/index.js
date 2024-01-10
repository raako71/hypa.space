const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({origin: true});

exports.validateAndCheckUsername =
  functions.https.onRequest(async (req, res) => {
    try {
      const {username} = req.body;

      // Validation: Check if the username matches the allowed pattern
      const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!validUsernameRegex.test(username)) {
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

      // Username is valid and unique
      res.status(200).send("Username is valid and unique");
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  });


exports.writeUsernameToFirestore =
  functions.https.onRequest(async (req, res) => {
    try {
      const {username, userID} = req.body;

      // Validation: Check if the username matches the allowed pattern
      const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!validUsernameRegex.test(username)) {
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

      // Write the validated username to Firestore
      await userDocRef.update({
        [username]: userID || true,
        // Optionally associate with userID if provided
      });

      res.status(200).send("Username successfully added to Firestore");
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
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
