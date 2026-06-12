import React, { useState, useEffect } from "react";
import API from "../../api";
import CategorySlider from "../HomePage/CategorySlider.jsx";
import FeaturedProductsSection from "../HomePage/FeaturedProductsSection.jsx";
import ProductsSection from "../HomePage/ProductsSection.jsx";

const BestSellerPage = ({ handleAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/best-sellers")
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching best sellers:", err))
      .finally(() => setLoading(false));
  }, []);

  

  // Filter state (shared between FeaturedProductsSection and ProductsSection)
  const [filters, setFilters] = useState({
    size: [],
    color: [],
    price: 18650,
    category: [],
    gender: [],
    isCustomizationEnabled: false,
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading best sellers...</p>
      </div>
    );
  }

  return (
    <div className="reseller-page">
      <FeaturedProductsSection
        products={products}
        filters={filters}
        setFilters={setFilters}
        handleAddToCart={handleAddToCart}
        fixedPage={false}
        pageType="bestsellers"
      />


      {/* Reseller Products Section with filters */}


      {/* <ProductsSection
        products={resellerProducts}
        title="Reseller Collection"
        link="/reseller-collection"
        handleAddToCart={handleAddToCart}
        filters={filters} // Added filters prop
        setFilters={setFilters} // Added setFilters prop
      />
 */}


    </div>
  );
};

export default BestSellerPage;