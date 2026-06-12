import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom"; 
import { AuthContext } from "../../context/AuthContext";

const MobileMenu = ({ isMenuOpen, setIsMenuOpen }) => {   
  const { isLoggedIn, logout } = useContext(AuthContext); 

  // helper function to close menu
  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <div className={`mobile-nav-menu ${isMenuOpen ? "open" : ""}`}>
      <style>{`
        .menu-link {
          display: block;
          padding: 1rem 0.5rem;
          /*text-align: right;*/
          font-size: 1.125rem;
          font-weight: 600;
          /*color: #B8860B;*/
          color: #A1712F;
          text-decoration: none;
          /*border-bottom: 1px solid #FFECB3;*/
          border-radius: 6px;
          transition: all 0.2s ease-in-out;
        }
        .menu-link:hover {
          /*background-color: #FFECB3;*/
          color: #1a1a1a;
        }
        .menu-link.active {
          /*background-color: #FFD700;*/
          color: #1a1a1a;
        }
        .mobile-menu-button {
          background: transparent;
          border: none;
          /*color: #B8860B;*/
          color: #A1712F;
          cursor: pointer;
          margin-bottom: 0;
        }
        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 3.5rem 1rem;
        }
      `}</style>

      <button
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? (
          <span>&#10005;</span>
        ) : (
          <span>&#9776;</span>
        )}
      </button>

      <div className="mobile-nav-list">
        <NavLink to="/" end className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Home</NavLink>
        <NavLink to="/all-products" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>All Products</NavLink>
        <NavLink to="/best-sellers" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Best Sellers</NavLink>
        <NavLink to="/whats-new" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>What's New</NavLink>
        <NavLink to="/featured-products" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Featured Products</NavLink>
        {/* <NavLink to="/collections" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Collections</NavLink> */}
        <NavLink to="/about" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>About Us</NavLink>
        <NavLink to="/contact" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Contact</NavLink>
        {isLoggedIn && (
          <>
            <NavLink to="/profile" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Profile</NavLink>
            <NavLink to="/orders" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Orders</NavLink>
          </>
          
        )}

        {isLoggedIn ? (
          <Link to="/" onClick={() => { logout(); handleLinkClick(); }} className="menu-link">Logout</Link>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={handleLinkClick}>Register</NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
