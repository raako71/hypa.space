import { useState } from "react";

const DropdownMenu = () => {
    return (
        <div className="dropdown-menu">
            <ul>
                <li>Logout</li>
                <li>Menu 2</li>
                <li>Menu 3</li>
            </ul>
        </div>
    );
};



function Header({ isLoggedIn }) {

    const [isDropdownVisible, setDropdownVisible] = useState(true);

    const handleMouseEnter = () => {
        setDropdownVisible(true);
    };

    const handleMouseLeave = () => {
        setDropdownVisible(false);
    };



    return (
        <header>
            <h1>hypa.space</h1>
            <nav className="navbar">
                <ul>
                    <li><a href="./">Home</a></li>
                    {isLoggedIn ? (
                            <li><a href="./account">Account</a>
                                <ul className="submenu">
                                    <li><a href="">Logout</a></li>
                                </ul>
                            </li>
                    ) : (
                        <li><a href="./login">Login</a></li>
                    )}
                </ul>
            </nav>

        </header>
    );
}
export default Header