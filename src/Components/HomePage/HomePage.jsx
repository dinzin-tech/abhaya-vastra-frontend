


// import React, { useState, useEffect } from "react";
// import API from "../../api";
// import "./HomePage.css";
// import Banner from "./Banner";
// import CategorySlider from "./CategorySlider";
// import BestSellers from "./BestSeller";
// import FeaturedProductsSection from "./FeaturedProductsSection";
// import ShopByCategory from "./ShopByCategory";
// import CustomizedProduct from "./CustomizedProduct";
// import NewArrivals from "./NewArrivals";
// import VideoShorts from "./VideoShorts";
// import ProductsSection from "./ProductsSection";
// import ReviewsBanner from "./ReviewsBanner";
// import GalleryWithLightbox from "./GalleryWithLightbox";
// import { bannerImages, shortsList } from "../products";

// const HomePage = ({ handleAddToCart }) => {
//   // --- States for API data ---
//   const [allProducts, setAllProducts] = useState([]);
//   const [bestSellers, setBestSellers] = useState([]);
//   const [newArrivals, setNewArrivals] = useState([]);
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Fetch all products from API
//   useEffect(() => {
//     API.get("/products")
//       .then((res) => {
//         const products = res.data.data || [];
//         setAllProducts(products);
//         // Use all products as featured by default
//         setFeaturedProducts(products);
//       })
//       .catch((err) => console.error("Error fetching products:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   // Fetch best sellers from API
//   useEffect(() => {
//     API.get("/best-sellers")
//       .then((res) => setBestSellers(res.data.data || []))
//       .catch((err) => console.error("Error fetching best sellers:", err));
//   }, []);

//   // Fetch new arrivals - using products sorted by created_at
//   useEffect(() => {
//     API.get("/products")
//       .then((res) => {
//         const products = res.data.data || [];
//         // Take latest products as new arrivals
//         setNewArrivals(products.slice(0, 8));
//       })
//       .catch((err) => console.error("Error fetching new arrivals:", err));
//   }, []);

//   // --- Filters ---
//   const [filters, setFilters] = useState({
//     size: [],
//     color: [],
//     price: 20000,
//     category: [],
//     gender: [],
//     isCustomizationEnabled: false,
//   });

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: "50px" }}>
//         <p>Loading products...</p>
//       </div>
//     );
//   }

//   // ✅ Show only 6 featured products on mobile
//   const visibleAllProducts = isMobile
//     ? allProducts.slice(0, 6)
//     : allProducts;

//   const visibleBestSellers = isMobile ? bestSellers.slice(0, 4) : bestSellers.slice(0, 3);
//   const visibleNewArrivals = isMobile ? newArrivals.slice(0, 4) : newArrivals.slice(0, 3);
//   const visibleFeaturedProducts = isMobile ? featuredProducts.slice(0, 4) : featuredProducts.slice(0, 3);

//   return (
//     <>
//       <Banner bannerImages={bannerImages} />

//       {/* Desktop */}
//       {/* <div className="desktop-only"><ShopByCategory /></div> */}

//       {/* Mobile */}
//       {/* <div className="mobile-only"><CategorySlider /></div> */}

//       <FeaturedProductsSection
//         // products={allProducts}
//         products={visibleAllProducts}
//         filters={filters}
//         setFilters={setFilters}
//         handleAddToCart={handleAddToCart}
//         fixedPage={false}
//         pageType="home"
//       />

//       <ProductsSection
//         products={visibleBestSellers}
//         title="Best Sellers"
//         link="/best-sellers"
//         handleAddToCart={handleAddToCart}
//       />
//       <ProductsSection
//         products={visibleNewArrivals}
//         title="New Arrivals"
//         link="/new-arrivals"
//         handleAddToCart={handleAddToCart}
//       />
//       <ProductsSection
//         products={visibleFeaturedProducts}
//         title="Featured Products"
//         link="/featured-products"
//         handleAddToCart={handleAddToCart}
//       />

//       <VideoShorts shorts={shortsList} handleAddToCart={handleAddToCart} />
//       <ReviewsBanner bannerImages={bannerImages} />
//       <GalleryWithLightbox images={bannerImages} autoSlideInterval={3000} />
//     </>
//   );
// };

// export default HomePage;
import React, { useState, useEffect } from "react";
import API from "../../api";
import "./HomePage.css";
import Banner from "./Banner";
import CategorySlider from "./CategorySlider";
import BestSellers from "./BestSeller";
import FeaturedProductsSection from "./FeaturedProductsSection";
import ShopByCategory from "./ShopByCategory";
import CustomizedProduct from "./CustomizedProduct";
import NewArrivals from "./NewArrivals";
import VideoShorts from "./VideoShorts";
import ProductsSection from "./ProductsSection";
import ReviewsBanner from "./ReviewsBanner";
import GalleryWithLightbox from "./GalleryWithLightbox";
import { bannerImages, shortsList } from "../products";

const HomePage = ({ handleAddToCart }) => {
  // --- States for API data ---
  const [allProducts, setAllProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // --- Responsive check ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- Fetch all products ---
  useEffect(() => {
    API.get("/products")
      .then((res) => {
        const products = res.data.data || [];
        setAllProducts(products);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false), setLoadingProducts(false));
  }, []);

  // --- Fetch featured products ---
  useEffect(() => {
    API.get("/featured-products")
      .then((res) => setFeaturedProducts(res.data.data || []))
      .catch((err) => console.error("Error fetching featured products:", err));
  }, []);

  // --- Fetch best sellers ---
  useEffect(() => {
    API.get("/best-sellers")
      .then((res) => setBestSellers(res.data.data || []))
      .catch((err) => console.error("Error fetching best sellers:", err));
  }, []);

  // --- Fetch new arrivals ---
  useEffect(() => {
    API.get("/products")
      .then((res) => {
        const products = res.data.data || [];
        setNewArrivals(products.slice(0, 8)); // latest 8 as new arrivals
      })
      .catch((err) => console.error("Error fetching new arrivals:", err));
  }, []);

  // --- Filters ---
  const [filters, setFilters] = useState({
    size: [],
    color: [],
    price: 20000,
    category: [],
    gender: [],
    isCustomizationEnabled: false,
  });

  // --- Loader ---
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading products...</p>
      </div>
    );
  }

  // --- Responsive slicing ---
  const visibleAllProducts = isMobile ? allProducts.slice(0, 6) : allProducts;
  const visibleBestSellers = isMobile
    ? bestSellers.slice(0, 4)
    : bestSellers.slice(0, 3);
  const visibleNewArrivals = isMobile
    ? newArrivals.slice(0, 4)
    : newArrivals.slice(0, 3);
  const visibleFeaturedProducts = isMobile
    ? featuredProducts.slice(0, 4)
    : featuredProducts.slice(0, 3);

  // --- Render ---
  return (
    <>
      <Banner bannerImages={bannerImages} />

      {/* <div className="desktop-only"><ShopByCategory /></div> */}
      {/* <div className="mobile-only"><CategorySlider /></div> */}

      {/* Featured Section */}
      <FeaturedProductsSection
        products={visibleAllProducts}
        filters={filters}
        setFilters={setFilters}
        handleAddToCart={handleAddToCart}
        fixedPage={false}
        pageType="home"
        loadingProducts={loadingProducts}
        setLoadingProducts={setLoadingProducts}
      />

      {/* Best Sellers */}
      <ProductsSection
        products={visibleBestSellers}
        title="Best Sellers"
        link="/best-sellers"
        handleAddToCart={handleAddToCart}
      />

      {/* New Arrivals */}
      <ProductsSection
        products={visibleNewArrivals}
        title="New Arrivals"
        link="/whats-new"
        handleAddToCart={handleAddToCart}
      />

      {/* Featured Products */}
      <ProductsSection
        products={visibleFeaturedProducts}
        title="Featured Products"
        link="/featured-products"
        handleAddToCart={handleAddToCart}
      />

      {/* Other Sections */}
      <VideoShorts shorts={shortsList} handleAddToCart={handleAddToCart} />
      <ReviewsBanner bannerImages={bannerImages} />
      <GalleryWithLightbox images={bannerImages} autoSlideInterval={3000} />
    </>
  );
};

export default HomePage;
