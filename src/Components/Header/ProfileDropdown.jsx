import React from "react";
import { Link } from "react-router-dom";

const ProfileDropdown = ({ isProfileMenuOpen, handleProfileClick, onLogout }) => (
  <div className="relative UserProfile">
    <button aria-label="User Profile" className="icon-button" onClick={handleProfileClick}>
      <i className="far fa-user"></i>
    </button>

    {isProfileMenuOpen && (
      <div className="profile-dropdown">
        <Link to="/profile" className="dropdown-link">My Profile</Link>
        <Link to="/orders" className="dropdown-link">Orders</Link>
        <hr className="dropdown-divider" />
        <button className="dropdown-link signout-link" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    )}
  </div>
);

export default ProfileDropdown;
