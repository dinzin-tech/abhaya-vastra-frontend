// import React, { useRef } from "react";
// import { Link } from "react-router-dom";
// import "./SlidingBanner.css";

// const SlidingBanner = ({ products = [] }) => {
//   const bannerRef = useRef(null);
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const scrollStart = useRef(0);

//   const handleMouseDown = (e) => {
//     isDragging.current = true;
//     startX.current = e.clientX;
//     scrollStart.current = bannerRef.current.scrollLeft;
//     bannerRef.current.style.cursor = "grabbing";
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const walk = startX.current - e.clientX;
//     bannerRef.current.scrollLeft = scrollStart.current + walk;
//   };

//   const handleMouseUp = (e) => {

//     if (!isDragging.current) return;
//     isDragging.current = false;
//     bannerRef.current.style.cursor = "grab";

//     const scrollLeft = bannerRef.current.scrollLeft;
//     const items = bannerRef.current.children;
//     if (items.length === 0) return;

//     const itemWidth = items[0].offsetWidth;

//     // Determine how far user dragged
//     const walk = scrollLeft - scrollStart.current;

//     let index = Math.round(scrollLeft / itemWidth); // current nearest item

//     // If dragged more than 25% of item width, jump next/prev
//     const threshold = itemWidth * 0.01;

//     if (walk > threshold) {
//       // dragged left → go next
//       index = Math.ceil(scrollStart.current / itemWidth)+1;

//     } else if (walk < -threshold) {
//       // dragged right → go previous
//       index = Math.floor(scrollStart.current / itemWidth) - 1;
//     } else {
//       // small drag → stay on nearest item
//       index = Math.round(scrollStart.current / itemWidth);
//     }

//     // Clamp index
//     const maxIndex = items.length - 1;

//     // console.log("maxindex", maxIndex);

//     const targetIndex = Math.min(Math.max(index, 0), maxIndex);

//     // Scroll smoothly
//     bannerRef.current.scrollTo({
//       left: targetIndex * itemWidth,
//       behavior: "smooth",
//     });

//   };

//   const handleMouseLeave = () => handleMouseUp();

//   return (
//     <div
//       ref={bannerRef}
//       className="sliding-banner"
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseLeave}
//     >
//       {products.map((product) => (
//         <div key={product.id} className="banner-item">
//           <span className="product-name">{product.name}</span>
//           <Link to={`/product/${product.id}`} className="shop-now-link">
//             Shop Now
//           </Link>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SlidingBanner;



import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SlidingBanner.css";

const SlidingBanner = ({ products = [] }) => {
  const bannerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const currentIndex = useRef(0);
  const intervalRef = useRef(null);
  const isHovered = useRef(false);

  /* -------------------- Auto Slide -------------------- */
  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isHovered.current || isDragging.current) return; // pause if user interacting
      const container = bannerRef.current;
      const items = container?.children;
      if (!container || items.length === 0) return;

      const itemWidth = items[0].offsetWidth;
      const total = items.length;

      currentIndex.current = (currentIndex.current + 1) % total;
      container.scrollTo({
        left: currentIndex.current * itemWidth,
        behavior: "smooth",
      });
    }, 5000);
  };

  /* -------------------- Drag Events -------------------- */
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = bannerRef.current.scrollLeft;
    bannerRef.current.style.cursor = "grabbing";
    clearInterval(intervalRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const walk = startX.current - e.clientX;
    bannerRef.current.scrollLeft = scrollStart.current + walk;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    bannerRef.current.style.cursor = "grab";

    const container = bannerRef.current;
    const items = container.children;
    const itemWidth = items[0].offsetWidth;
    const scrollLeft = container.scrollLeft;
    const walk = scrollLeft - scrollStart.current;

    let index = Math.round(scrollLeft / itemWidth);
    const threshold = itemWidth * 0.1; // must drag at least 10% width

    if (walk > threshold) {
      index = Math.min(index + 1, items.length - 1); // dragged left → next
    } else if (walk < -threshold) {
      index = Math.max(index - 1, 0); // dragged right → prev
    }

    currentIndex.current = index;
    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });

    startAutoSlide(); // resume auto slide
  };

  const handleMouseLeave = () => {
    if (isDragging.current) handleMouseUp();
  };

  /* -------------------- Hover Events -------------------- */
  const handleMouseEnter = () => {
    isHovered.current = true;
    clearInterval(intervalRef.current);
  };

  const handleMouseOut = () => {
    isHovered.current = false;
    startAutoSlide();
  };

  /* -------------------- Lifecycle -------------------- */
  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [products]);

  return (
    <div
      ref={bannerRef}
      className="sliding-banner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseOut={handleMouseOut}
    >
      {products.map((product) => (
        <div key={product.id} className="banner-item">
          <span className="product-name">{product.name}</span>
          <Link to={`/product/${product.id}`} className="shop-now-link">
            Shop Now
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SlidingBanner;
