import React, { useState, useRef, useEffect } from "react";
import API from "../../api"; // your axios instance
import "./GalleryWithLightbox.css";

const GalleryWithLightbox = ({ autoSlideInterval = 3000 }) => {
  const [images, setImages] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto slide state
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(true);

  const galleryRef = useRef(null);
  const autoSlideTimerRef = useRef(null);

  // ✅ Fetch gallery images from backend
  useEffect(() => {
    API.get("/gallery")
      .then((res) => {
        const baseUrl = import.meta.env.VITE_STORAGE_BASE_URL || "http://127.0.0.1:8000/storage/"; // adjust if needed
        const formattedImages = res.data.map((item) => baseUrl + item.image);
        setImages(formattedImages);
      })
      .catch((err) => console.error("Error fetching gallery:", err));
  }, []);

  // Lightbox handlers
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    stopAutoSlide();
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    startAutoSlide();
  };

  const goNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((idx) => (idx + 1) % images.length);
    resetAutoSlide();
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((idx) => (idx - 1 < 0 ? images.length - 1 : idx - 1));
    resetAutoSlide();
  };

  // Auto-slide functionality
  const startAutoSlide = () => {
    if (!autoSlideEnabled || images.length <= 1 || !galleryRef.current) return;

    stopAutoSlide();

    autoSlideTimerRef.current = setInterval(() => {
      const gallery = galleryRef.current;
      const scrollWidth = gallery.scrollWidth;
      const clientWidth = gallery.clientWidth;
      const maxScrollLeft = scrollWidth - clientWidth;
      let nextScrollLeft = gallery.scrollLeft + 200;

      if (nextScrollLeft >= maxScrollLeft) nextScrollLeft = 0;

      gallery.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
    }, autoSlideInterval);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
  };

  const resetAutoSlide = () => {
    if (autoSlideEnabled) {
      stopAutoSlide();
      startAutoSlide();
    }
  };

  // Drag handlers
  const startDrag = (pageX) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    setStartX(pageX - galleryRef.current.offsetLeft);
    setScrollLeft(galleryRef.current.scrollLeft);
    stopAutoSlide();
  };

  const onDrag = (pageX) => {
    if (!isDragging || !galleryRef.current) return;
    const x = pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    galleryRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDrag = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        if (autoSlideEnabled) startAutoSlide();
      }, 1000);
    }
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.pageX);
  };
  
  const handleTouchStart = (e) => {
    startDrag(e.touches[0].pageX);
  };

  // Attach global move & end events
  useEffect(() => {
    const handleMouseMove = (e) => onDrag(e.pageX);
    const handleTouchMove = (e) => onDrag(e.touches[0].pageX);
    const handleMouseUp = () => stopDrag();
    const handleTouchEnd = () => stopDrag();

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, startX, scrollLeft]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") goNext(e);
      else if (e.key === "ArrowLeft") goPrev(e);
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen]);

  // Initialize auto-slide
  useEffect(() => {
    if (autoSlideEnabled && images.length > 1) {
      const timeoutId = setTimeout(() => startAutoSlide(), 1000);
      return () => {
        clearTimeout(timeoutId);
        stopAutoSlide();
      };
    }
    
    return () => {
      stopAutoSlide();
    };
  }, [autoSlideEnabled, images.length]);

  // Hover pause
  const handleMouseEnter = () => stopAutoSlide();
  const handleMouseLeave = () => {
    if (autoSlideEnabled && !isDragging) {
      setTimeout(() => startAutoSlide(), 500);
    }
  };

  const scrollToImage = (index) => {
    if (!galleryRef.current) return;
    const gallery = galleryRef.current;
    const imageWidth = 150 + 10;
    const targetScrollLeft = index * imageWidth;
    gallery.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  };

  return (
    <div className="gallery-with-lightbox">
      <div
        className={`gallery-grid ${isDragging ? "dragging" : ""}`}
        ref={galleryRef}
        onMouseDown={(e) => startDrag(e.pageX)}
        onTouchStart={(e) => startDrag(e.touches[0].pageX)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {images.map((src, idx) => (
          <div key={idx} className="gallery-item">
            <img
              src={src}
              alt={`Gallery ${idx + 1}`}
              className="gallery-thumb"
              onClick={() => scrollToImage(idx)}
            />
            <div
              className="gallery-zoom-icon"
              onClick={() => openLightbox(idx)}
            >
              +
            </div>
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="auto-slide-controls">
          <button
            className={`auto-slide-btn ${autoSlideEnabled ? "active" : ""}`}
            onClick={() => {
              const newState = !autoSlideEnabled;
              setAutoSlideEnabled(newState);
              newState ? startAutoSlide() : stopAutoSlide();
            }}
            title={autoSlideEnabled ? "Pause auto-slide" : "Play auto-slide"}
          >
            {autoSlideEnabled ? "⏸️" : "▶️"}
          </button>
        </div>
      )}

      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-btn prev" onClick={goPrev}>
              ‹
            </button>
            <img
              src={images[currentIndex]}
              alt={`Lightbox ${currentIndex + 1}`}
              className="lightbox-image"
            />
            <button className="lightbox-btn next" onClick={goNext}>
              ›
            </button>
            <button className="lightbox-close" onClick={closeLightbox}>
              ×
            </button>
            <div className="lightbox-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryWithLightbox;
