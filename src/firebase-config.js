import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: "AIzaSyCdlYyIHlX-77dcY_Ui3QeI9gbhcJ3ZYTE",
  authDomain: "hypa-space.firebaseapp.com",
  projectId: "hypa-space",
  storageBucket: "hypa-space.appspot.com",
  messagingSenderId: "632824718692",
  appId: "1:632824718692:web:02066e7e1e881afe1dc671",
  measurementId: "G-9NMHKPYMNZ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db }; // Add 'app' to the export statement