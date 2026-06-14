import React, { useState, useContext, useEffect } from "react";
import API from "../../api";
import "./Header.css";
import MobileMenu from "./MobileMenu";
import Searchbar from "./Searchbar";
import ProfileDropdown from "./ProfileDropdown";
import CartSidebar from "./CartSidebar";
import WalletModal from "../Wallet/WalletModal";
import logo from "../../assets/logo.png";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { AuthContext } from "../../context/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SlidingBanner from "./SlidingBanner";
import {allProducts} from "../products";
import SocialLinks from "../HomePage/SocialLinks";
import TopRibbon from "./TopRibbon";
import SearchResults from "./SearchResults";

const Header = () => {

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const bannerProducts = allProducts;

  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { cartItems, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch categories from API
  useEffect(() => {
    API.get("/categories")
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() === "") return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsMenuOpen(false);
  };

  const handleCartClick = () => setIsCartOpen(!isCartOpen);

  return (
    <header className="header">
      {/* Green Sliding Banner */}
      <SlidingBanner products={bannerProducts} />
      {/* Top Ribbon */}
      <TopRibbon />
      
      <nav className="nav-container">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <i className="fa-solid fa-xmark"></i>
          ) : (
            <i className="fa-solid fa-bars"></i>
          )}
        </button>

        {/* Logo */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src={logo} alt="MyShop Logo" className="logo-image" />
            {/* <h1 className="logo-text">The Saayal</h1> */}
          </Link>
          {/* <SocialLinks className="small" /> */}
        </div>

        {/* Right Side Icons */}
        <div className="icon-group">
          <Searchbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            isSearching={isSearching}
          />

          {/* Add this mobile search toggle button */}
          <button
            className="icon-button mobile-search-toggle"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Search"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className={`icon-button wishlist-button ${wishlistItems.length > 0 ? "wishlist-glow" : ""}`}
            aria-label="Wishlist"
          >
            <i className="fas fa-heart"></i>
            {wishlistItems.length > 0 && (
              <span className="wishlist-badge">{wishlistItems.length}</span>
            )}
          </Link>

          {/* Wallet Icon - Only show if logged in */}
          {isLoggedIn && (
            <button
              className="icon-button wallet-button"
              onClick={() => setIsWalletOpen(true)}
              aria-label="My Wallet"
              title="My Wallet"
            >
              <i className="fas fa-wallet"></i>
            </button>
          )}

          {/* Profile Dropdown or Login/Register */}
          {isLoggedIn ? (
            <ProfileDropdown
              isProfileMenuOpen={isProfileMenuOpen}
              handleProfileClick={handleProfileClick}
              onLogout={logout}
            />
          ) : (
            <div className="auth-buttons">
              <button className="login-button" onClick={() => navigate("/login")}>Login</button>
              <button className="register-button" onClick={() => navigate("/register")}>Register</button>
            </div>
          )}

          {/* Cart Icon */}
          <button
            aria-label="Shopping Cart"
            className="icon-button cart-button"
            onClick={handleCartClick}
          >
            <i className="fas fa-shopping-cart"></i>
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
            {/* <span className="cart-text">
              Cart {cartItems.length > 0 ? `(${cartItems.length})` : ""}
            </span> */}
          </button>
        </div>
      </nav>

      <div className="navbar-links">
        {/* Desktop Nav Links */}
        <div className="nav-links-desktop">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>HOME</NavLink>
          
          {/* Dropdown */}
          <div className="nav-dropdown">
            <button className="nav-link dropdown-button">ALL CATEGORIES<i className="fas fa-angle-down"></i></button>
            <div className="dropdown-menu">
              <NavLink to="all-products" className="dropdown-link">
                All Products
              </NavLink>
              {categories.map((cat) => (
                cat.slug ? (
                  <NavLink 
                    key={cat.id}
                    to={`/category/${cat.slug}`} 
                    className="dropdown-link"
                  >
                    {cat.name}
                  </NavLink>
                ) : null
              ))}
            </div>
          </div>

          <NavLink to="/all-products" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>ALL PRODUCTS</NavLink>
          <NavLink to="/best-sellers" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>BEST SELLERS</NavLink>
          <NavLink to="/whats-new" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>WHAT'S NEW</NavLink>

          <NavLink to="/featured-products" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>FEATURED PRODUCTS</NavLink>

          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>ABOUT US</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>CONTACT</NavLink>
        </div>
      </div>

      {/* Components */}
      <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <CartSidebar />
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />

      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="mobile-search-modal">
          <div className="mobile-search-header">
            <button
              className="mobile-search-back"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="mobile-search-input-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mobile-search-input"
                autoFocus
              />
              <button
                className="mobile-search-submit"
                onClick={() => {
                  handleSearch();
                  // Don't close immediately, let users see results
                }}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
          
          {/* Mobile Search Results - Always show when there's search term */}
          <div className="mobile-search-results">
            {searchTerm && (
              <div className="mobile-results-content">
                <SearchResults 
                  searchTerm={searchTerm} 
                  onProductClick={() => setIsMobileSearchOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;


