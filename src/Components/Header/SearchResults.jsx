import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api.js"; // your axios instance

const SearchResults = ({ searchTerm, onProductClick }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm?.trim()) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/search?query=${searchTerm}`);
        const data = response.data?.data;

        if (Array.isArray(data) && data.length > 0) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  // Fetch recommended items (if needed)
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await API.get("/best-sellers");
        const data = response.data?.data;
        setRecommendedItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching recommended items:", error);
        setRecommendedItems([]);
      }
    };

    fetchRecommended();
  }, []);

  if (loading) {
    return (
      <div className="mobile-search-results-container">
        <div className="mobile-search-loader">Loading results...</div>
      </div>
    );
  }

  const productsToShow = searchResults.length > 0 ? searchResults : recommendedItems;
  const isSearchResults = searchResults.length > 0;

  return (
    <div className="mobile-search-results-container">
      <h4 className="mobile-results-title">
        {isSearchResults ? "Search Results" : "Recommended For You"}
      </h4>

      <div className="mobile-results-grid">
        {productsToShow.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.slug || encodeURIComponent(item.name)}`}
            className="mobile-result-card"
            onClick={onProductClick}
          >
            <img src={item.image} alt={item.name} className="mobile-result-image" />
            <div className="mobile-result-info">
              <span className="mobile-result-name">{item.name}</span>
              {item.rating && (
                <div className="mobile-result-rating">
                  <i className="fas fa-star"></i>
                  <span>{item.rating} ({item.reviews || 0})</span>
                </div>
              )}
              <span className="mobile-result-price">
                {item.price ? `Rs. ${item.price}` : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {isSearchResults && searchResults.length > 5 && (
        <div className="mobile-view-more">
          <button
            className="mobile-view-more-button"
            onClick={() => {
              onProductClick();
              navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
            }}
          >
            View All {searchResults.length} Products
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;