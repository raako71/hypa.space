import {auth} from "./firebase-config"
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
                <a href="./">Home</a>
                {isLoggedIn ? (
                    <div className="has-submenu">
                        <a href="./account" >Account</a>
                        <ul className="submenu">
                            <li><a href="#" onClick={handleSignOut}>Logout</a></li>
                        </ul>
                    </div>
                ) : (
                    <a href="./login">Login</a>
                )}
            </nav>

        </header>
    );
}
export default Header