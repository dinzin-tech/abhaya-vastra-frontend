import React from "react";
import { Link } from "react-router-dom";
import "./PradaStory.css";

const PradaStory = () => {
  return (
    <section className="prada-story-section">
      <div className="story-container">
        <div className="story-content">
          <span className="story-tag font-prada-heading">HAUTE COUTURE & BESPOKE TAILORING</span>
          <h2 className="story-heading font-prada-heading">
            REDEFINING MODERN LUXURY & CRAFTSMANSHIP
          </h2>
          <p className="story-quote">
            "Fashion is a language created in an instant to decode any given moment. Each piece is designed to reflect conceptual identity, precision tailoring, and timeless elegance."
          </p>
          <div className="story-actions">
            <Link to="/all-products" className="prada-btn-primary">
              EXPLORE OUR COLLECTION
            </Link>
            <Link to="/about" className="prada-btn-secondary">
              OUR BRAND HERITAGE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PradaStory;
