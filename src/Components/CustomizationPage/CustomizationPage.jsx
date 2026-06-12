import React, { useState, useCallback } from "react";
import "./CustomizationPage.css";
import { Link } from "react-router-dom";

const CustomizedProducts = [
  {
    title: "Women’s Activewear",
    description:
      "High-performance, moisture-wicking gear designed for peak comfort and durability during any workout routine. Fully customizable colors and fit.",
    images: [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTv9ZARgjQ1NmfXxHIYJMGCAtfh8yeXJ6fSA5STlWQeK-L5i1xrBlcG_36D5TwPRmMOt3oJlL1PC6F0Bl8pnhLZE9xFEzjCRXuurkva2BF5mpUsxV_vfZMDBg",
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc",
      "https://placehold.co/600x400/38a169/ffffff?text=Activewear+Model+3", // Placeholder
    ],
    customizable: true,
  },
  {
    title: "Western Wear",
    description:
      "Trendy and chic outfits including denim, dresses, and jackets. Perfect for casual outings and parties, with options for bespoke detailing.",
    images: [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQO-RueX0_6B7yNr4Kw_RM1IyYLoyfGziBAf6TaEUWrNRcP-ckRfeG4b51aP_G69VggB4KDkxSKdio1ey_TExevZdcUS-YblOdFVwUQ4XT4vRTdFdJt1E7S",
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc",
    ],
    customizable: true,
  },
  {
    title: "Sportswear",
    description:
      "Optimized apparel for intense physical activities. Focus on breathability, flexibility, and supportive fit for maximum performance.",
    images: [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTmYTkNnVjMUUjWIhFmf1V0tktBWcWv2FbJ5xN1rch5-cGocIpuOQYtBlA-5-kgmeGEGuXBZj8oGjgNQEbfbYiqygesn_M33gjilE1p6HF68ffvvnJQD_uWHw",
      "https://placehold.co/600x400/9b59b6/ffffff?text=Sportswear+Model+2", // Placeholder
    ],
    customizable: true,
  },
  {
    title: "Loungewear",
    description:
      "Soft, comfortable fabrics designed for relaxation and home use. Mix and match pieces for the ultimate cozy experience.",
    images: [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTvyI0tZV89eHLNC-_bZCZtpjqIEgGJiXokfAYoRnsU4RhP0SEzp57w_Jui9Pnr_0M3n4k_GL7vBJ_czk9bxZD46UEOCBO4O-lOaDzxrXpXle9LDjoG83PI",
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc",
    ],
    customizable: true,
  },
  {
    title: "Innerwear",
    description:
      "Essential foundational garments focusing on support, shape retention, and comfort for all-day wear.",
    images: [
      "https://www.technosport.in/cdn/shop/files/P798IronGrey_1.jpg?v=1738840962&width=1946",
      "https://placehold.co/600x400/2c3e50/ffffff?text=Innerwear+Comfort", // Placeholder
    ],
    customizable: true,
  },
  {
    title: "Lingerie",
    description:
      "Delicate and intimate apparel designed for elegance and a perfect fit. Featuring lace, silk, and comfortable stretch materials.",
    images: [
      "https://cdn.shopify.com/s/files/1/0266/6276/4597/files/bra_panty_set_d5d7d11a-9684-4a5b-873f-bc89058ef2e3.jpg?v=1679471630",
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc",
    ],
    customizable: true,
  },
  {
    title: "Shorts",
    description:
      "Versatile bottom wear for casual, sporty, or lounge use. Available in various lengths, cuts, and materials for every activity.",
    images: [
      "https://claura.in/cdn/shop/products/Shorts-19-brown-6.jpg?v=1702710320&width=1080",
      "https://placehold.co/600x400/f39c12/ffffff?text=Denim+Shorts", // Placeholder
    ],
    customizable: true,
  },
  {
    title: "Trousers",
    description:
      "Tailored or relaxed fit trousers suitable for office, casual, or formal settings. Designed for comfort and structured style.",
    images: [
      "https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/30063124/2024/6/28/af6c493c-30ec-450e-b588-e565911532a81719562420746TheRoadsterLifestyleCoLinenRelaxed-FitRegularTrousers1.jpg",
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg&usqp=CAc",
    ],
    customizable: true,
  },
];

const CarouselCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = product.images.length;

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  }, [totalImages]);

  const goToPrev = useCallback(() => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + totalImages) % totalImages
    );
  }, [totalImages]);

  const transformValue = `translateX(-${currentImageIndex * 100}%)`;

  return (
    <div className="cp-card">
      <div className="cp-card-content-top">
        <h3 className="cp-card-title">{product.title}</h3>
        <p className="cp-card-description">{product.description}</p>
      </div>

      <div className="cp-carousel-container">
        <div className="cp-carousel-wrapper" style={{ transform: transformValue }}>
          {product.images.map((imageSrc, index) => (
            <img
              key={index}
              src={imageSrc}
              alt={`${product.title} image ${index + 1}`}
              className="cp-carousel-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x600/cccccc/333333?text=Image+Unavailable";
              }}
            />
          ))}
        </div>

        {totalImages > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="cp-nav-button cp-nav-button-left"
              aria-label="Previous image"
            >
              <svg
                className="cp-nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="cp-nav-button cp-nav-button-right"
              aria-label="Next image"
            >
              <svg
                className="cp-nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <div className="cp-dots-container">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`cp-dot ${
                    index === currentImageIndex
                      ? "cp-dot-active"
                      : "cp-dot-inactive"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                ></div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="cp-card-content-bottom">
        <Link
          to={`/product/${encodeURIComponent(product.title)}`}
          className="cp-button-primary"
          role="button"
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

const CustomizationPage = () => {
  return (
    <div className="cp-container">
      <section className="cp-section">
        <h2 className="cp-title">Customized Products</h2>

        <div className="cp-grid">
          {CustomizedProducts.map((product, index) => (
            <CarouselCard key={index} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomizationPage;
