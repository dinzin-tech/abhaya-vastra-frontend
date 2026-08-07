import React from "react";
import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";
import "./ProductsSection.css";

const ProductsSection = ({ title, products, link, handleAddToCart }) => (
  <section className="products-section section-container">
    <div className="section-header-row">
      <h2 className="section-heading">{title}</h2>
      {link && (
        <Link to={link} className="prada-view-all-link">
          EXPLORE ALL &rarr;
        </Link>
      )}
    </div>

    <ProductGrid products={products} handleAddToCart={handleAddToCart} />

    {link && (
      <div className="section-footer-cta">
        <Link to={link} className="prada-btn-outline">
          VIEW FULL COLLECTION
        </Link>
      </div>
    )}
  </section>
);

export default ProductsSection;