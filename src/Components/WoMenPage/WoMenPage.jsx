import React, { useState } from "react";
import FeaturedProductsSection from "../HomePage/FeaturedProductsSection";
import { allProducts } from "../products";


const WoMenPage = () => {
  const [filters, setFilters] = useState({
    size: [],
    color: [],
    price: 200,
    category: [],
    gender: ["female"], 
    isCustomizationEnabled: false,
  });

  return (
    <div>
    <FeaturedProductsSection
      products={allProducts.filter(product => product.gender === "female")}
     filters={filters}
     setFilters={setFilters}
     fixedPage={true}
    pageType="women" 
   />

    </div>
  );
};

export default WoMenPage;
