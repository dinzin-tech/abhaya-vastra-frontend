import React, { useRef, useEffect, useState } from "react";
import "./CategorySlider.css"; 
import { Link } from "react-router-dom";


const CategorySlider = () => {
  const categorySliderRef = useRef(null);

  const categories = [
    { 
      name: "Jackets", 
      image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1739951338_6120268.jpg?w=480&dpr=1.0",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "T-shirts", 
      image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1755880153_8401247.jpg?w=480&dpr=1.0",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "Jeans", 
      image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1756484433_1539494.jpg?w=480&dpr=1.0",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "Dresses", 
      image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1742814761_6527894.jpg?w=480&dpr=1.0",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "Shirts", 
      image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1743053253_9340490.jpg?w=480&dpr=1.0",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "Hoodies & Sweatshirts", 
      image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1756808127_2016863.jpg?w=480&dpr=1.0",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "Suits & Blazers", 
      image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTfVEaZTMyKKxuiCmwHYo8eveZd_yfF7DL2LoZ74UiaGTy2Sg-DaqTlLIuDPYxA3Yd-Q8lxt0PY9ihTMIdhNrGKbJz3RyDUjHCm_5EKsws",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    },
    { 
      name: "Sportswear", 
      image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRgM8kRQpwIVfbNYiHysA2rc_HnnAcdvkSCvqyYcFcnHGk_4PklhOfEKi-X35hQ0j2GnRGsWWdpOjaAeQlffyFzyufYPqXSkvCo3OfVY7S4DGaqgFc0FrtwMQ",
      hoverImage: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQQPk0qG6GCMfWbkpKThPFfsQPgiUldbe_cUs7kWunW84e5bbiJH9NVbr_kXemttE_BEJDwGaa-zzGN9dpxiKTzhJ68LbNCzmIc0bNT4OyV5nkZ97ozQrEYsg"
    }
  ];

  const loopedCategories = [...categories, ...categories];

  const scrollLeft = () =>
    categorySliderRef.current.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    categorySliderRef.current.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    const slider = categorySliderRef.current;

    const handleScroll = () => {
      if (slider.scrollLeft === 0) {
        slider.scrollLeft = slider.scrollWidth / 2;
      } else if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
        slider.scrollLeft = slider.scrollWidth / 2 - slider.clientWidth;
      }
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="category-section section-container">
      <div className="category-slider-wrapper" style={{ marginTop: "2rem" }}>
        <button onClick={scrollLeft} className="scroll-button left" aria-label="Scroll left">
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <div ref={categorySliderRef} className="category-slider">
          {loopedCategories.map((category, index) => (
            <CategoryItem key={index} category={category} />
          ))}
        </div>

        <button onClick={scrollRight} className="scroll-button right" aria-label="Scroll right">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

const CategoryItem = ({ category }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="category-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/category/${category.name}`} className="category-link">
        <div className="image-wrapper">
          <img
            src={category.image}
            alt={category.name}
            className={`main-img ${hovered ? "hidden" : "visible"}`}
          />
          {category.hoverImage && (
            <img
              src={category.hoverImage}
              alt={`${category.name} hover`}
              className={`hover-img ${hovered ? "visible" : "hidden"}`}
            />
          )}
        </div>
        <span>{category.name}</span>
      </Link>
    </div>
  );
};

export default CategorySlider;
