import React, { useState, useEffect, useRef } from "react";
import API from "../../api";
import "./Banner.css";

/* ─── Fallback banners (used when DB has no banners) ─────────────────────── */
const FALLBACK_BANNERS = [
  {
    id: "fallback-1",
    title: "AUTUMN / WINTER 2026",
    subtitle: "EDITORIAL COLLECTION",
    description: "HAUTE COUTURE & LUXURY READY-TO-WEAR",
    button_text: "EXPLORE COLLECTION",
    product_link: "/all-products",
    image_url:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    isFallback: true,
  },
  {
    id: "fallback-2",
    title: "THE ART OF ELEGANCE",
    subtitle: "RUNWAY SELECTION",
    description: "EXCLUSIVE TAILORED SUITS & EVENING GOWNS",
    button_text: "DISCOVER LOOKS",
    product_link: "/all-products",
    image_url:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop",
    isFallback: true,
  },
  {
    id: "fallback-3",
    title: "FINE ACCESSORIES & APPAREL",
    subtitle: "LUXURY ESSENTIALS",
    description: "HANDBAGS, PRINTED TEES & HANDCRAFTED WEAR",
    button_text: "SHOP COLLECTION",
    product_link: "/all-products",
    image_url:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
    isFallback: true,
  },
];

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef(null);

  const IMAGE_BASE_URL =
    import.meta.env.VITE_STORAGE_BASE_URL || "http://127.0.0.1:8000/storage/";

  useEffect(() => {
    API.get("/banner")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // API banners only have `image` — mark them so we don't overlay text
          setBanners(res.data.map((b) => ({ ...b, isFallback: false })));
          setUseFallback(false);
        } else {
          setUseFallback(true);
        }
      })
      .catch(() => {
        setUseFallback(true);
      });
  }, []);

  const activeBanners = useFallback || banners.length === 0
    ? FALLBACK_BANNERS
    : banners;

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (!activeBanners.length) return;
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex, isDragging, activeBanners.length]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      } else {
        setCurrentIndex(
          (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
        );
      }
    }
    setIsDragging(false);
  };

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const getImageUrl = (banner) => {
    if (!banner) return FALLBACK_BANNERS[0].image_url;
    if (banner.image_url) return banner.image_url;
    if (banner.image) {
      // Absolute URL already?
      if (banner.image.startsWith("http")) return banner.image;
      return `${IMAGE_BASE_URL}${banner.image}`;
    }
    return FALLBACK_BANNERS[0].image_url;
  };

  // Show text overlay only for fallback banners (API banners already have text in the image)
  const showTextOverlay = currentBanner?.isFallback !== false;

  return (
    <section className="prada-hero-banner-section">
      <div
        className="prada-hero-banner-container"
        ref={carouselRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseMove={handleDragMove}
        onTouchMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
      >
        {/* Slides */}
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`prada-hero-slide ${index === currentIndex ? "active" : ""}`}
          >
            <img
              src={getImageUrl(banner)}
              alt={banner.title || "Editorial Campaign"}
              className="prada-hero-image"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="prada-hero-overlay" />
          </div>
        ))}

        {/* Text overlay — only shown when using fallback banners */}
        {showTextOverlay && (
          <div className="prada-hero-content-container" key={currentIndex}>
            <div className="prada-hero-badge">
              {currentBanner.subtitle || "EDITORIAL COLLECTION"}
            </div>
            <h1 className="prada-hero-title">
              {currentBanner.title || "AUTUMN / WINTER 2026"}
            </h1>
            <p className="prada-hero-subtitle">
              {currentBanner.description || "HAUTE COUTURE & LUXURY READY-TO-WEAR"}
            </p>
            <a
              href={currentBanner.product_link || "/all-products"}
              className="prada-btn-white prada-hero-cta"
            >
              {currentBanner.button_text || "EXPLORE THE COLLECTION"}
            </a>
          </div>
        )}

        {/* Carousel indicators */}
        <div className="prada-hero-indicators">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              className={`prada-hero-indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;
