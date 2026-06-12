// import React from "react";

// const SortSelect = ({ sortOption, setSortOption, isMobile = false }) => {
//   return (
//     <div className={`sort-select-container ${isMobile ? 'mobile-sort' : 'desktop-sort'}`}>
//       <label htmlFor="sort" className="sort-label">Sort by:</label>
//       <select
//         id="sort"
//         className="sort-select"
//         value={sortOption}
//         onChange={(e) => setSortOption(e.target.value)}
//       >
//         <option value="none">None</option>
//         <option value="price-asc">Price: Low to High</option>
//         <option value="price-desc">Price: High to Low</option>
//         <option value="name-asc">Name: A-Z</option>
//       </select>
//     </div>
//   );
// };

// export default SortSelect;

import React, { useState, useRef, useEffect } from "react";
import "./SortSelect.css"; // new file

const SortSelect = ({ sortOption, setSortOption, isMobile = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const options = [
    { value: "none", label: "None" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A-Z" },
  ];

  const currentLabel = options.find((o) => o.value === sortOption)?.label || "None";

  // map sortOption -> FontAwesome icon class
  const iconClass = (() => {
    switch (sortOption) {
      case "price-asc":
        return "fa-arrow-up";
      case "price-desc":
        return "fa-arrow-down";
      case "name-asc":
        return "fa-sort-alpha-up";
      default:
        return "fa-sort";
    }
  })();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setSortOption(value);
    setOpen(false);
  };

  return (
    <div
      className={`sort-icon-wrapper ${isMobile ? "mobile" : "desktop"}`}
      ref={ref}
    >
      <button
        className="sort-icon-btn"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        title={`Sort (${currentLabel})`}
      >
        <i className={`fa-solid ${iconClass}`} aria-hidden="true"></i>
      </button>

      {open && (
        <div className="sort-dropdown" role="menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              role="menuitem"
              className={`sort-option ${sortOption === opt.value ? "active" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortSelect;