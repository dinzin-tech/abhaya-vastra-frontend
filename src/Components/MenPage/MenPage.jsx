import React, { useState } from "react";
import FeaturedProductsSection from "../HomePage/FeaturedProductsSection";
import { allProducts } from "../products";

const MenPage = () => {
  const [filters, setFilters] = useState({
    size: [],
    color: [],
    price: 200,
    category: [],
    gender: ["male"],
    isCustomizationEnabled: false,
  });

  // Only pass products and filters, no need for addToCart prop
  return (
    <div>
      <FeaturedProductsSection
        products={allProducts.filter(p => p.gender === "male")}
        filters={filters}
        setFilters={setFilters}
        pageType="men"
      />
    </div>
  );
};

export default MenPage;
