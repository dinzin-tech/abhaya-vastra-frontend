import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api.js";

const Searchbar = ({ searchTerm, setSearchTerm, handleSearch, isSearching }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false); // ✅ new state
  const searchContainerRef = useRef(null);

  // ✅ Fetch recommended products dynamically
  useEffect(() => {
    API.get("/best-sellers")
      .then((res) => {
        console.log("Recommended API:", res.data);
        const data = res.data;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.recommended)
          ? data.recommended
          : [];
        setRecommendedItems(items);
      })
      .catch((err) => console.error("Error fetching recommended products:", err));
  }, []);

  // ✅ Fetch search results
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    setLoadingSearch(true);

    const timeout = setTimeout(() => {
      API.get(`/search`, {
        params: { query: searchTerm },
        signal: controller.signal,
      })
        .then((res) => {
          const results = res.data?.data || [];
          setSearchResults(results);
        })
        .catch((err) => {
          if (err.name !== "CanceledError") {
            console.error("Error fetching search results:", err);
          }
        })
        .finally(() => setLoadingSearch(false));
    }, 300); // debounce

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm]);

  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    const input = searchContainerRef.current?.querySelector(".search-input");
    if (input) input.focus();
  };

  // ✅ Loader element
  const Loader = () => (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Searching...</p>
    </div>
  );

  return (
    <div className="search-container" ref={searchContainerRef}>
      <input
        type="text"
        placeholder={isSearching ? "Searching..." : "Search products..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={(e) => {
          const container = e.currentTarget.parentElement;
          setTimeout(() => {
            if (!container.contains(document.activeElement)) {
              setShowResults(false);
            }
          }, 100);
        }}
        className="search-input"
      />

      <button
        aria-label="Search"
        className="search-button"
        onClick={handleSearch}
        disabled={isSearching}
      >
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>

      {showResults && (
        <div className="search-results-popup">
          {/* ✅ Preloader while fetching */}
          {loadingSearch ? (
            <Loader />
          ) : searchResults.length > 0 ? (
            <div className="product-result-section">
              <h4 className="recommended-title">Product Results</h4>
              <div className="results-grid">
                {searchResults.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug || encodeURIComponent(item.name)}`}
                    className="result-card"
                  >
                    <img src={item.image} alt={item.name} className="result-image" />
                    <div className="result-info">
                      <span className="result-name single-line">{item.name}</span>
                      <span className="result-price">Rs. {item.price}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ✅ Show More Button */}
              {searchResults.length > 4 && (
                <div className="view-more-container">
                  <Link
                    to={`/search?query=${encodeURIComponent(searchTerm)}`}
                    className="view-more-button"
                    onClick={() => {
                      setShowResults(false); // ✅ Close popup
                    }}
                  >
                    View All ({searchResults.length - 4} more)
                  </Link>
                </div>
              )}

            </div>
          ) : (
            // ✅ Show recommended products safely
            <div className="recommended-section">
              <h4 className="recommended-title">Recommended For You</h4>
              <div className="results-grid">
                {(Array.isArray(recommendedItems) ? recommendedItems : []).slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug || encodeURIComponent(item.name)}`}
                    className="result-card"
                  >
                    <img src={item.image} alt={item.name} className="result-image" />
                    <div className="result-info">
                      <span className="result-name single-line">{item.name}</span>
                      <span className="result-price">Rs. {item.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Searchbar;