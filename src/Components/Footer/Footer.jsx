import React from "react";
// import footerlogo from "../../assets/logo1.png";
import footerlogo from "../../assets/logo.png";
import "./Footer.css";
import { NavLink } from "react-router-dom";
import SocialLinks from "../HomePage/SocialLinks";

const Footer = () => (
  <>
    <footer className="footer">
      <div className="footer-container">
        {/* Logo, Name, and Description Column */}
        <div className="logo-column">
          <a href="/" aria-label="Abhaya Vastra Logo">
            <img src={footerlogo} className="footerlogo" alt="Abhaya Vastra" />
            {/* <h1>Abhaya Vastra</h1> */}
          </a>
          {/* <p className="company-name">Abhaya Vastra</p> */}
          <p className="description">
            We are a premium online clothing store dedicated to providing the
            latest trends and highest quality apparel.
          </p>
        </div>

        {/* Customer Service Column */}
        <div>
          <h4 className="column-title">Customer Service</h4>
          <ul className="link-list">
            <li>
              <NavLink to="/contact">Contact Us</NavLink>
            </li>
            <li>
              <NavLink to="/faqs">FAQs</NavLink>
            </li>

            <li>
              <NavLink to="/privacy">Privacy Policy</NavLink>
            </li>

            <li>
              <NavLink to="/terms">Terms and Conditions</NavLink>
            </li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="column-title">Quick Links</h4>
          <ul className="link-list">
           
            <li>
              <NavLink to="/" end className={({ isActive }) => `${isActive ? "active" : ""}`}>Home</NavLink>
            </li>
            <li>
              <NavLink to="/best-sellers" className={({ isActive }) => `${isActive ? "active" : ""}`}>Best Sellers</NavLink>
            </li>
            <li>
              <NavLink to="/whats-new" className={({ isActive }) => `${isActive ? "active" : ""}`}>What's New</NavLink>
            </li>
            <li>
              <NavLink to="/featured-products" className={({ isActive }) => `${isActive ? "active" : ""}`}>Featured Products</NavLink>
            </li>
            {/* <li>
              <NavLink to="/collections" className={({ isActive }) => `${isActive ? "active" : ""}`}>Collections</NavLink>
            </li> */}
            <li>
              <NavLink to="/about" className={({ isActive }) => ` ${isActive ? "active" : ""}`}>About Us</NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `${isActive ? "active" : ""}`}>Contact</NavLink>
            </li>
          </ul>
        </div>

        {/* Follow Us Column */}
        <div>
          <h4 className="column-title">Follow Us</h4>
          <SocialLinks />
        </div>

        {/* Company Legal Details Column */}
        <div>
          <h4 className="column-title">Legal Details</h4>
          <div className="legal-details" style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "#564b47" }}>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <strong>Udyam Reg Number:</strong><br />
              UDYAM-KR-03-0713235
            </p>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <strong>Office Address:</strong><br />
              Abhaya Vastra<br />
              #52/A, 6th Cross, Attur Layout<br />
              Abhaya Yelahanka New Town 1st<br />
              Yelahanka New Town<br />
              Bengaluru, Karnataka – 560064<br />
              India
            </p>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <strong>Phone:</strong><br />
              8217013567<br />
              7411016567 (Alternative)
            </p>
            <p style={{ margin: "0" }}>
              <strong>Email:</strong><br />
              info@abhayavastra.store
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="copyright">
        &copy; 2026 Abhaya Vastra. All Rights Reserved. 
        {/* Powered by Razorpay. */}
        <span className="dev-credit">developed & maintained by <strong>DINZIN</strong></span>
      </div>
    </footer>
  </>
);

export default Footer;
