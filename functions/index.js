const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.validateAndCheckUsername = functions.https.onRequest(
    async (req, res) => {
      try {
        const {username} = req.body;

        // Validation: Check if the username matches the allowed pattern
        const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!validUsernameRegex.test(username)) {
          res.status(400).send("Invalid username format");
          return;
        }

        // Check uniqueness of username in the 'allusers' document
        const usersSnapshot = await admin.
            firestore().collection("users").doc("allusers").get();
        const allUsernames = usersSnapshot.data().usernames || [];

        if (allUsernames.includes(username)) {
          res.status(409).send("Username already exists");
          return;
        }

        // Username is valid and unique, can proceed with further actions
        res.status(200).send("Username is valid and unique");
      } catch (error) {
        res.status(500).send("Error: " + error.message);
      }
    });
