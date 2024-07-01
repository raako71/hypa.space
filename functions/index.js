const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({origin: true});

exports.writeUsernameToFirestore = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {username, userID, test} = req.body;

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

      const usernameL = username.toLowerCase(); // Convert username to lowercase

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
        res.status(500).send("Invalid userID");
        console.error("No userID sent");
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
            console.error(`Username mismatch in Firestore.
              ${existingUsername} doesn't match up.`);
            res.status(500).send("Well that's weird.");
            return;
          }
        } else {
          console.error("Username deleted from personal document.");
          res.status(500).send("Well that's weird.");
          return;
        }

        if (test) { // Check if test is 'true' as a string
          res.status(200).send("All good to go");
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

      res.status(200).send(`Username successfully added to Firestore. 
Username: ${username}, UserID: ${userID}, Test: ${test}`);
    } catch (error) {
      console.error(error);
      return res.status(500).send(`Error: ${error.message}. 
Username: ${username}, UserID: ${userID}, Test: ${test}`);
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

exports.getCategories = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Verify user authentication
      const {authorization} = req.headers;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        res.status(403).send("Unauthorized");
        return;
      }
      // Fetch categories from Firestore
      const categoriesCollectionRef =
        admin.firestore().collection("categories");
      const categoriesSnapshot = await categoriesCollectionRef.get();

      const categories = {};
      categoriesSnapshot.forEach((doc) => {
        const categoryId = doc.id;
        const categoryData = doc.data();
        categories[categoryId] = categoryData;
      });

      // Send categories in the response
      res.status(200).json({categories});
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});

exports.updateStore = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {userID, userName, storeName, delete: shouldDelete} = req.body;

    try {
      // Verify user authentication
      if (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) {
        return res.status(403).send("Unauthorized");
      }
      const idToken = req.headers.authorization.split("Bearer ")[1];
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);

      // Check if the userID in the request matches the authenticated user's UID
      if (userID !== decodedIdToken.uid) {
        return res.status(403).send("User ID does not match the current user");
      }

      const storesDocRef = admin.firestore().collection("users").doc("stores");

      if (shouldDelete) {
        // Find the key to delete based on userID
        const storeData = (await storesDocRef.get()).data();
        const keyToDelete = Object.keys(storeData).
            find((key) => storeData[key][0] === userID);

        if (keyToDelete) {
          await storesDocRef.update({
            [keyToDelete]: admin.firestore.FieldValue.delete(),
          });
        }
      } else {
        // Update or create a new store entry
        await storesDocRef.set({
          [userName]: [userID, storeName],
        }, {merge: true});
      }

      return res.status(200).send({message: "Store updated successfully"});
    } catch (error) {
      console.error("Error updating store:", error);
      return res.status(500).send({issue: "Unable to update store"});
    }
  });
});

/**
 * Deletes all files in a Firebase Storage directory.
 * @param {string} directoryPath - Path to the Firebase Storage directory.
 * @return {Promise<void>} Resolves if successful, or throws an error.
 */
async function deleteFiles(directoryPath) {
  try {
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({prefix: directoryPath});

    await Promise.all(files.map(async (file) => {
      await file.delete();
    }));

    console.log(`Files in directory ${directoryPath} successfully deleted.`);
  } catch (error) {
    console.error(`Error deleting files in directory ${directoryPath}:`, error);
    throw new Error(`Failed to delete files: ${error.message}`);
  }
}


exports.deleteFiles = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const path = req.body.path;
    const parts = path.split("/");
    const userID = parts[1];

    const currentUserIdToken = req.headers.authorization.split("Bearer ")[1];
    const currentUser = await admin.auth().verifyIdToken(currentUserIdToken);

    if (userID !== currentUser.uid) {
      res.status(403).send("Unauthorized access.");
      return;
    }
    try {
      await deleteFiles(path);
      res.status(200).
          json({message: `Files successfully deleted.`});
    } catch (error) {
      res.status(500).
          json({error: `Failed to process request: ${error.message}`});
    }
  });
});
