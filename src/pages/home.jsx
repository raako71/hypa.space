import { domain } from "../App";
import { auth } from "../firebase-config"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

function handleSignInWithEmailLink() {
    // Confirm the link is a sign-in with email link.
    if (isSignInWithEmailLink(auth, window.location.href)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation');
        }
        // The client SDK will parse the code from the link for you.
        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                window.location.href = domain; // Change '/' to your home page URL
            })
            .catch((error) => {
                console.error(error)
            });
    }
}

window.onload = function () {
    handleSignInWithEmailLink();
};



export default function Home() {
    return (
        <>
            <div className="article">
                <h1>Home</h1>
            </div>
        </>
    )
}