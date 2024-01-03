import {auth} from "./firebase-config"
import {domain} from "./App"

const handleSignOut = async () => {
    try {
      await auth.signOut(); // Call your authentication library's sign-out method
      // After successful sign-out, update local storage or perform any necessary tasks
      localStorage.setItem('isLoggedIn', 'false'); // For example, update the authentication status in local storage
      // Redirect or perform other actions as needed
      window.location.pathname = '/'; // Redirect to the index page or another desired route
    } catch (error) {
      console.error('Error signing out:', error); // Handle sign-out errors if needed
    }
  };

function Header({ isLoggedIn }) {

    return (
        <header>
            <h1>hypa.space</h1>
            <nav className="navbar">
                <a href={domain}>Home</a>
                {isLoggedIn ? (
                    <div className="has-submenu">
                        <a href={domain + "/account"} >Account</a>
                        <ul className="submenu">
                            <li><a href="#" onClick={handleSignOut}>Logout</a></li>
                        </ul>
                    </div>
                ) : (
                    <a href={domain + "/login"}>Login</a>
                )}
            </nav>

        </header>
    );
}
export default Header