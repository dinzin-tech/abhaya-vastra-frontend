import React from "react";
import SocialLinks from "../HomePage/SocialLinks"; // adjust path as needed
import "./TopRibbon.css";

const TopRibbon = () => {
  return (
    <div className="top-ribbon">
      <div className="ribbon-content">
        {/* <span className="ribbon-text">Welcome to Our Store!</span> */}
        {/* show current date and time in the format 14th Oct 2025 6:23 PM */}
        {/* <span className="ribbon-text">{new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span> */}
        <SocialLinks className="ribbon-socials" />
      </div>
    </div>
  );
};

export default TopRibbon;
