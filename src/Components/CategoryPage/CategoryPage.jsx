import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../api";
import ProductCard from "../HomePage/ProductCard";
import FilterSidebar from "../HomePage/FilterSidebar";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  

  const [sortOption, setSortOption] = useState("default");
  const [filters, setFilters] = useState({
    gender: [],
    size: "",
    color: [],
    price: 20000,
    category: [],
  });

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let endpoint = "/products";
        
        if (category && category !== "shop") {
          endpoint = `/products-by-category?category_name=${category}`;
        }
        
        const res = await API.get(endpoint);
        if (res.data.success) {
          setProducts(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // Apply filters
  let filteredProducts = [...products];

  // Apply category filter (from FilterSidebar)
  if (filters.category.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      filters.category.includes(p.category)
    );
  }

  // Apply size filter
  if (filters.size) {
    filteredProducts = filteredProducts.filter((p) =>
      p.sizes && p.sizes.includes(filters.size)
    );
  }

  // Apply price filter
  if (filters.price < 20000) {
    filteredProducts = filteredProducts.filter((p) => 
      (p.total_price || p.price) <= filters.price
    );
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.total_price || a.price;
    const priceB = b.total_price || b.price;
    
    if (sortOption === "price-asc") return priceA - priceB;
    if (sortOption === "price-desc") return priceB - priceA;
    if (sortOption === "name-asc") return a.name.localeCompare(b.name);
    if (sortOption === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  if (loading) {
    return (
      <div className="category-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-container">
      <div className="category-sidebar-wrapper">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          pageType="home"
        />

        <div className="category-main">
          <div className="flex-header">
            <h2 className="title">
              {!category || category === "shop"
                ? "All Products"
                : category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </h2>

            <div className="sort-container">
              <label htmlFor="sort" className="sort-label">Sort by:</label>
              <select
                id="sort"
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}>
                <option value="default">None</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </div>
          </div>

          <div className="grid-container">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="empty-message">No products found in this category.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
