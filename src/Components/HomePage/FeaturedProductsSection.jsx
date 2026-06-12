import React, { useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "./ProductGrid";
import { CartContext } from "../../context/CartContext";
import SortSelect from "./SortSelect";

const FeaturedProductsSection = ({ products, filters, setFilters, pageType = "home", loadingProducts, setLoadingProducts }) => {
  const [sortOption, setSortOption] = useState("none");
  const { addToCart } = useContext(CartContext); // Context used directly in ProductCard
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = isMobile ? 6 : 12;  // set page size based on mobile or desktop

  // Add resize listener for mobile detection
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter & sort products based on page type and filters
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Page-specific filtering
    if (pageType === "customized") {
      filtered = filtered.filter(p => p.customizable);
    } else if (pageType === "men") {
      filtered = filtered.filter(p => p.gender === "male" && !p.customizable);
    } else if (pageType === "women") {
      filtered = filtered.filter(p => p.gender === "female" && !p.customizable);
    } else {
      filtered = filters.isCustomizationEnabled
        ? filtered.filter(p => p.customizable)
        : filtered.filter(p => !p.customizable);
    }

    // Sidebar filters (size, color, category, price)
    const applySidebarFilters = !filters.isCustomizationEnabled && pageType !== "customized";
    if (applySidebarFilters) {

      if (filters.category?.length)
        filtered = filtered.filter(p => filters.category.includes(p.category));

      if (filters.size && filters.size.length > 0) {
        filtered = filtered.filter(p => {
          // Normalize sizes array and handle both ['S', 'M'] or [{label:'S'}]
          const productSizes = p.sizes?.map(s => (typeof s === "string" ? s : s.label)) || [];

          // If multiple sizes are selected
          if (Array.isArray(filters.size)) {
            return filters.size.some(size => productSizes.includes(size));
          }

          // If only one size (string)
          return productSizes.includes(filters.size);
        });
      }


      if (filters.color?.length)
        filtered = filtered.filter(p => filters.color.includes(p.color));

      if (filters.price != null)
        filtered = filtered.filter(p => p.price <= filters.price);

    }

    // Sorting
    if (sortOption === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sortOption === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sortOption === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [products, filters, sortOption, pageType]);

  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedProducts, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOption]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const showSorting = !filters.isCustomizationEnabled && pageType !== "customized";

  const toTitleCase = (str) =>
          str
            ?.toLowerCase()
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

  const headingText = 
                    pageType === "search"
                      ? `Results for "${filters?.searchQuery || ""}"`
                      : pageType === "category"
                        ? (filters?.category?.[0] ? toTitleCase(filters.category[0]) : "Category")
                        : pageType === "customization"
                            ? "Customized"
                            : pageType === "men"
                              ? "Men's"
                              : pageType === "women"
                                ? "Women's"
                                : pageType === "bestsellers"
                                  ? "Best Seller"
                                  : pageType === "whats-new"
                                    ? "What's New"
                                    : pageType === "featured-products"
                                      ? "Featured"
                                      : "All";

  return (
    <section className="product-section">

      {showSorting && (
        <div className="sort-container">

          <div className="heading-wrap">
            {pageType === "search" ? (
              <h5 className="section-heading desktop-heading">{headingText}</h5>
            ) : <h2 className="section-heading desktop-heading">{headingText} Products</h2>}
            
          </div>

          <div className="sort-wrap">
            {!isMobile && (
              <SortSelect
                sortOption={sortOption}
                setSortOption={setSortOption}
                isMobile={false}
              />
            )}
          </div>
        </div>
      )}

      <div className="product-layout">
        <div className={`sidebar-fixed ${pageType === "customization" ? "hidden" : ""}`}>
          {/* <FilterSidebar filters={filters} onFilterChange={handleFilterChange} pageType={pageType} /> */}
          <FilterSidebar 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            pageType={pageType}
            sortOption={sortOption}
            setSortOption={setSortOption}
            headingText={headingText}
          />
        </div>

        {/* <div className="product-grid-container">
          <ProductGrid products={pageType === "home" ? filteredAndSortedProducts : paginatedProducts} selectedSizes={filters.size} />
          {pageType !== "home" && filteredAndSortedProducts.length > PAGE_SIZE && (
            <div className="pagination-container">
              {Array.from({ length: Math.ceil(filteredAndSortedProducts.length / PAGE_SIZE) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`pagination-button ${currentPage === idx + 1 ? "active" : ""}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div> */}

        <div className="product-grid-container">
          {/* {filteredAndSortedProducts.length === 0 ? (
            <p className="empty-message">No products found.</p>
          ) : (
            <>
              <ProductGrid
                products={pageType === "home" ? filteredAndSortedProducts : paginatedProducts}
                selectedSizes={filters.size}
              />

              {pageType !== "home" && filteredAndSortedProducts.length > PAGE_SIZE && (
                <div className="pagination-container">
                  {Array.from({ length: Math.ceil(filteredAndSortedProducts.length / PAGE_SIZE) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`pagination-button ${currentPage === idx + 1 ? "active" : ""}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )} */}

          {loadingProducts ? (
            <p>Loading..</p>
          ) : (
            filteredAndSortedProducts.length === 0 ? (
            <p className="empty-message">No products found.</p>
          ) : (
            <>
              <ProductGrid
                products={pageType === "home" ? filteredAndSortedProducts : paginatedProducts}
                selectedSizes={filters.size}
              />

              {pageType !== "home" && filteredAndSortedProducts.length > PAGE_SIZE && (
                <div className="pagination-container">
                  {Array.from({ length: Math.ceil(filteredAndSortedProducts.length / PAGE_SIZE) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`pagination-button ${currentPage === idx + 1 ? "active" : ""}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )
          )}
        </div>

      </div>
      {pageType === "home" ? (
        <div>
          {/* <a href="/all-products" className="show-more-button">View All Products</a> */}
          <Link
            to="/all-products"
            className="show-more-button"
          >
              Show More
          </Link>
        </div>
      ) : null}
      
    </section>
  );
};

export default FeaturedProductsSection;
