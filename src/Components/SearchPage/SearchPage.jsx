import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FeaturedProductsSection from "../HomePage/FeaturedProductsSection.jsx";
import API from "../../api.js";

const SearchResultsPage = () => {
    const { search } = useLocation();
    const query = new URLSearchParams(search).get("query") || "";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filter state (shared between FeaturedProductsSection and ProductsSection)
    const [filters, setFilters] = useState({
        size: [],
        color: [],
        price: 18650,
        category: [],
        gender: [],
        isCustomizationEnabled: false,
        searchQuery: query,
    });

  useEffect(() => {
    if (!query) return;
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/search?query=${encodeURIComponent(query)}`);
        const data = response.data?.data || [];
        setProducts(Array.isArray(data) ? data : []);
        console.log("search prods", products);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Capitalize first letter for heading
  const formattedHeading =
    query.length > 0
      ? `Search Results for "${query.charAt(0).toUpperCase() + query.slice(1)}"`
      : "Search";

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="search-page-container">
      <FeaturedProductsSection
        title={formattedHeading}
        pageType="search"
        products={products}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default SearchResultsPage;
