


import React, { useState, useEffect } from "react";
import API from "../../api";
import "./FilterSidebar.css";
import SortSelect from "./SortSelect";

// const FilterSidebar = ({ filters = {}, onFilterChange, pageType = "home" }) => {
const FilterSidebar = ({ 
  filters = {}, 
  onFilterChange, 
  pageType = "home",
  sortOption,
  setSortOption,
  ...props
}) => {
  const {
    category = [],
    color = [],
    price = 18650,
    size = [],
    isCustomizationEnabled = false,
  } = filters;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 900);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    API.get("/categories")
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const hideOtherFilters = pageType === "customized" || isCustomizationEnabled;

  return (
    <>
      {isMobile && (
        <div className="mobile-controls-row">
          <button
            className="sidebar-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            ☰ <i class="fa-solid fa-filter"></i>
          </button>

          {/* Mobile Heading (hidden on desktop) */}
          <div className="mobile-heading">
            {pageType === "search" ? (
              <h5 className="section-heading mobile-heading">
                {`Searching "${filters?.searchQuery || ""}"`}
              </h5>
            ) : 
            <h1>{props && props.headingText ? props.headingText : "Filters"}</h1> }
          </div>

          {/* Mobile Sort - shown on mobile, hidden on desktop */}
          {isMobile && (
            <SortSelect 
              sortOption={sortOption} 
              setSortOption={setSortOption} 
              isMobile={true}
            />
          )}

        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <aside
        className={`sidebar-container ${
          isOpen ? "open" : "collapsed"
        } ${pageType === "customization" ? "hidden" : ""}`}
      >
        <h3>Filters</h3>

        <div className="filter-section">
          {!hideOtherFilters && (
            <>
              {/* Category */}
              <div className="filter-group">
                <h4>Category</h4>
                <div className="checkbox-group">
                  {categories.map((cat) => (
                    <label key={cat.id}>
                      <input
                        type="checkbox"
                        checked={category.includes(cat.name)}
                        onChange={(e) => {
                          const newCategory = e.target.checked
                            ? [...category, cat.name]
                            : category.filter((c) => c !== cat.name);
                          onFilterChange("category", newCategory);
                        }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              {/* <div className="filter-group">
                <h4>Size</h4>
                <div className="size-group">
                  {["S", "M", "L", "XL", "XXL"].map((s) => (
                    <span
                      key={s}
                      className={`size-label ${size.includes(s) ? "selected" : ""}`}
                      onClick={() => {
                        const newSizes = size.includes(s)
                          ? size.filter((x) => x !== s)
                          : [...size, s];
                        onFilterChange("size", newSizes);
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div> */}
              <div className="filter-group">
                <h4>Size</h4>
                <div className="size-group">
                  {["S", "M", "L", "XL", "XXL"].map((s) => (
                    <span
                      key={s}
                      className={`size-label ${size === s ? "selected" : ""}`}
                      onClick={() => {
                        // If clicked size is already selected → deselect it (optional)
                        const newSize = size === s ? "" : s;
                        onFilterChange("size", newSize);
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="filter-group">
                <h4>Color</h4>
                <div className="color-group">
                  {[
                    "#DC2626",
                    "#3B82F6",
                    "#10B981",
                    "#4B5563",
                    "#FFFFFF",
                  ].map((c) => (
                    <span
                      key={c}
                      className={`color-circle ${
                        color.includes(c) ? "selected" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        const newColor = color.includes(c)
                          ? color.filter((x) => x !== c)
                          : [...color, c];
                        onFilterChange("color", newColor);
                      }}
                    ></span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="filter-group price-range">
                <h4>Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="18650"
                  value={price}
                  onChange={(e) =>
                    onFilterChange("price", Number(e.target.value))
                  }
                />
                <div className="price-labels">
                  <span>Rs. 0</span>
                  <span>Rs. {price}+</span>
                  <span>Rs. 18650</span>
                </div>
              </div>

              {/* <button className="apply-btn" onClick={() => setIsOpen((prev) => !prev)}>Apply Filters</button> */}

              <div className="filter-actions">
                <button
                  className="apply-btn"
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  Apply Filters
                </button>

                <button
                  className="apply-btn reset-btn"
                  onClick={() => {
                    // Reset all filters to default/empty
                    onFilterChange("category", []);
                    onFilterChange("size", "");
                    onFilterChange("color", []);
                    onFilterChange("price", 18650);
                    setIsOpen((prev) => !prev)
                  }}
                >
                  Reset
                </button>
              </div>

            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
