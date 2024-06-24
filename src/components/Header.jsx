import { auth } from "../firebase-config"
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const Header = ({ isLoggedIn, domain }) => {
    
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

    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <header>
            <h1><a href={domain} >hypa.space</a></h1>
            <nav className="navbar">
                <a href={domain}>Home</a>
                {isLoggedIn ? (
                    <>
                        <div className="has-submenu">
                            <a href={domain + "/products"} className={currentPath === '/products' ? 'active' : ''}>Products</a>
                            <ul className="submenu">
                                <li><a href={domain + "/newProduct"} className={currentPath === '/newProduct' ? 'active' : ''}>New Product</a></li>
                            </ul>
                        </div>
                        <div className="has-submenu">
                            <a href={domain + "/account"} className={currentPath === '/account' ? 'active' : ''}>Account</a>
                            <ul className="submenu">
                                <li><a href="#" onClick={handleSignOut}>Logout</a></li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <a href={domain + "/login"}>Login</a>
                )}
            </nav>

        </header>
    );
}

Header.propTypes = {
    domain: PropTypes.string,
    isLoggedIn: PropTypes.bool
};

export default Header