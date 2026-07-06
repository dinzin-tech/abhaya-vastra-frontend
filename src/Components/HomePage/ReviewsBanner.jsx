import React, { useState, useEffect, useRef } from "react";
import API from "../../api"; // your axios instance
import "./ReviewsBanner.css";

const ReviewsBanner = () => {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const wrapperRef = useRef(null);

  const IMAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || "http://127.0.0.1:8000/storage/";

  // ✅ Fetch reviews from API
  useEffect(() => {
    API.get("/review")
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  const goToSlide = (index) => {
    if (index < 0) index = reviews.length - 1;
    if (index >= reviews.length) index = 0;
    setCurrent(index);
  };

  const goNext = () => !isDragging && goToSlide(current + 1);
  const goPrev = () => !isDragging && goToSlide(current - 1);

  // ✅ Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [current, reviews.length]);

  // ✅ Drag functionality
  const handleStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setOffsetX(x - startX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    if (offsetX > 80) goToSlide(current - 1);
    else if (offsetX < -80) goToSlide(current + 1);
    setIsDragging(false);
    setOffsetX(0);
  };

  return (
    <section className="reviews-banner-section">
      <div
        className="reviews-banner-container"
        ref={wrapperRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="reviews-wrapper"
          style={{
            transform: `translateX(calc(${-current * 100}% + ${offsetX}px))`,
            transition: isDragging ? "none" : "transform 0.6s ease-in-out",
          }}
        >
          {reviews.map((r, i) => (
            <div
              className="review-slide"
              key={i}
              style={{
                backgroundImage: `url(${IMAGE_BASE_URL + r.image})`,
              }}
            >
              <div className="reviews-overlay">
                <div className="reviews-content">
                  <h1>Our Happy Clients</h1>
                  <div className="stars">
                    {"★".repeat(r.rating || 5)}
                    {"☆".repeat(5 - (r.rating || 5))}
                  </div>
                  <p className="review-text">{r.review}</p>
                  <p className="reviewer-name">— {r.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="reviews-nav-button left"
          onClick={goPrev}
          aria-label="Previous"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          className="reviews-nav-button right"
          onClick={goNext}
          aria-label="Next"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

export default ReviewsBanner;
