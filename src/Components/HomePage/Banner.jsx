import React, { useState, useEffect, useRef } from "react";
import API from "../../api"; // your axios instance

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef(null);

  const IMAGE_BASE_URL = "http://127.0.0.1:8000/storage/";

  // Fetch banners from API
  useEffect(() => {
    API.get("/banner")
      .then((res) => setBanners(res.data))
      .catch((err) => console.error("Error fetching banners:", err));
  }, []);

  // Drag handlers
  const handleDragStart = (e) => {
    e.preventDefault();
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
    const dragThreshold = 50;

    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  const goToSlide = (index) => {
    if (!banners.length) return;
    let newIndex = index;
    if (index < 0) newIndex = banners.length - 1;
    else if (index >= banners.length) newIndex = 0;
    setCurrentIndex(newIndex);
  };

  const goToNextBanner = () => {
    if (!isDragging) goToSlide(currentIndex + 1);
  };

  const handleButtonClick = (e, link) => {
    e.preventDefault();
    if (!isDragging && link) window.location.href = link;
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(goToNextBanner, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isDragging, banners]);

  // Add mouse/touch listeners
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.addEventListener("mousedown", handleDragStart);
    carousel.addEventListener("touchstart", handleDragStart);
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      carousel.removeEventListener("mousedown", handleDragStart);
      carousel.removeEventListener("touchstart", handleDragStart);
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, startX, currentX]);

  return (
    <section className="banner-section">
      <div
        className="banner-container"
        ref={carouselRef}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="banner-image-wrapper">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={`${IMAGE_BASE_URL}${banner.image}`}
              alt={`Banner ${index + 1}`}
              className={`banner-image ${index === currentIndex ? "active" : ""}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`,
                transition: isDragging ? "none" : "all 0.6s ease-in-out",
              }}
            />
          ))}

          {banners.length > 0 && (
            <div className="banner-overlay">
              <div className="banner-content">
                <h1 className="banner-heading">
                  {banners[currentIndex].title || ""}
                </h1>
                <p className="banner-text">
                  {banners[currentIndex].description || ""}
                </p>

                {/* ✅ Keep Shop Now / Buy Now buttons as is */}
                {currentIndex === 0 ? (
                  <button
                    className="shop-now-button"
                    onClick={(e) =>
                      handleButtonClick(e, banners[currentIndex].product_link)
                    }
                  >
                    Shop Now
                  </button>
                ) : (
                  <button
                    className="shop-now-button-secondary"
                    onClick={(e) =>
                      handleButtonClick(e, banners[currentIndex].product_link)
                    }
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {/* <button
          onClick={() => goToSlide(currentIndex - 1)}
          className="banner-nav-button left"
          aria-label="Previous banner"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button> */}
        {/* <button
          onClick={() => goToSlide(currentIndex + 1)}
          className="banner-nav-button right"
          aria-label="Next banner"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button> */}
      </div>
    </section>
  );
};

export default Banner;
