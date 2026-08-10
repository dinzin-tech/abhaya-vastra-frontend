import React from "react";
import "./Footer.css";
import { NavLink } from "react-router-dom";
import SocialLinks from "../HomePage/SocialLinks";
import footerLogo from "../../assets/footerlogo.png";

const Footer = () => (
  <footer className="footer prada-footer">
    <div className="prada-newsletter-section">
      <div className="newsletter-container">
        <h3 className="newsletter-title font-prada-heading">SUBSCRIBE TO ABHAYA VASTRA</h3>
        <p className="newsletter-sub">Be the first to receive updates on new arrivals, custom t-shirt drops, seasonal trends, and exclusive offers.</p>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="ENTER YOUR EMAIL ADDRESS" className="newsletter-input" required />
          <button type="submit" className="prada-btn-white">SUBSCRIBE</button>
        </form>
      </div>
    </div>

    <div className="footer-container">
      {/* Brand Column */}
      <div className="logo-column">
        <NavLink to="/" aria-label="Abhaya Vastra Clothing Brand" className="footer-brand-link">
          <img src={footerLogo} alt="Abhaya Vastra — Couture of Courage" className="footer-brand-logo-img" />
        </NavLink>
        <p className="description">
          Modern fashion brand featuring premium Men's & Women's wear, printed & customized t-shirts, and handcrafted bespoke couture.
        </p>
      </div>

      {/* Client Service Column */}
      <div>
        <h4 className="column-title font-prada-heading">CLIENT SERVICES</h4>
        <ul className="link-list">
          <li><NavLink to="/contact">Contact Boutique</NavLink></li>
          <li><NavLink to="/faqs">FAQs & Assistance</NavLink></li>
          <li><NavLink to="/privacy">Privacy Policy</NavLink></li>
          <li><NavLink to="/terms">Terms & Conditions</NavLink></li>
        </ul>
      </div>

      {/* Quick Links Column */}
      <div>
        <h4 className="column-title font-prada-heading">EXPLORE</h4>
        <ul className="link-list">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/best-sellers">Best Sellers</NavLink></li>
          <li><NavLink to="/whats-new">What's New</NavLink></li>
          <li><NavLink to="/featured-products">Featured Collections</NavLink></li>
          <li><NavLink to="/about">About Abhaya Vastra</NavLink></li>
        </ul>
      </div>

      {/* Legal & Connect Column */}
      <div>
        <h4 className="column-title font-prada-heading">LEGAL & CONNECT</h4>
        <div className="legal-details">
          <p><strong>Udyam Reg Number:</strong><br />UDYAM-KR-03-0713235</p>
          <p><strong>Email:</strong><br />info@abhayavastra.store</p>
        </div>
        <h4 className="column-title font-prada-heading" style={{ marginTop: '20px' }}>FOLLOW US</h4>
        <SocialLinks />
      </div>
    </div>

    {/* Copyright Section */}
    <div className="copyright">
      &copy; {new Date().getFullYear()} ABHAYA VASTRA CLOTHING BRAND. All Rights Reserved.
      <span className="dev-credit">developed & maintained by <strong>DINZIN</strong></span>
    </div>
  </footer>
);

export default Footer;
