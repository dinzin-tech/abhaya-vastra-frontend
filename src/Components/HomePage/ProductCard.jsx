

import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product, showRemove = false, selectedSizes = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentPrice, setCurrentPrice] = useState(product.total_price || product.price);

  const { addToCart } = useContext(CartContext);
  const { wishlistItems, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Size options from product.sizes - handle both formats
  const hasSizeOptions = product.sizes && product.sizes.length > 0;
  
  // Normalize sizes using useMemo to prevent infinite loops
  const normalizedSizes = React.useMemo(() => {
    return product.sizes?.map(s => typeof s === 'string' ? s : s.label) || [];
  }, [product.sizes]);

  // Function to get variant price based on selected size
  const getVariantPrice = (size) => {
    if (!size || !product.variants || product.variants.length === 0) {
      return product.total_price || product.price;
    }
    const variant = product.variants.find(v => v.size === size);
    if (variant) {
      return variant.total_price || variant.price || product.total_price || product.price;
    }
    return product.total_price || product.price;
  };

  useEffect(() => {
    let sizeToSelect = null;

    if (selectedSizes.length && normalizedSizes.length) {
      const match = normalizedSizes.find(s => s === selectedSizes);
      if (match) {
        sizeToSelect = match;
      }
    }

    if (!sizeToSelect && normalizedSizes.length > 0) {
      sizeToSelect = normalizedSizes[0];
    }

    if (sizeToSelect) {
      setSelectedSize(sizeToSelect);
      setCurrentPrice(getVariantPrice(sizeToSelect));
    }
  }, [selectedSizes, product.id, normalizedSizes.length]);

  const getVariantStock = (size) => {
    if (!size || !product.variants || product.variants.length === 0) {
      return 999;
    }
    const variant = product.variants.find(v => v.size === size);
    return variant?.stock ?? 0;
  };

  const currentStock = getVariantStock(selectedSize);
  const isOutOfStock = currentStock <= 0;

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const newPrice = getVariantPrice(size);
    setCurrentPrice(newPrice);
  };

  const handleAddToCart = () => {
    const sizeLabel = selectedSize || null;
    addToCart(
      {
        ...product,
        price: currentPrice,
      },
      1,
      sizeLabel
    );
  };

  return (
    <>
      <div
        className="product-card prada-product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-image-container">
          <Link to={`/product/${product.slug || encodeURIComponent(product.name)}`}>
            <img
              src={isHovered && product.hoverImage ? product.hoverImage : product.image}
              alt={product.name}
              className="product-image"
              loading="lazy"
              decoding="async"
            />
          </Link>
          <button
            className={`prada-wishlist-btn ${isInWishlist ? "active" : ""}`}
            onClick={toggleWishlist}
            aria-label="Wishlist"
          >
            <i className={isInWishlist ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
        </div>

      <div className="product-info">
        <Link to={`/product/${product.slug || encodeURIComponent(product.name)}`} className="product-title-link">
          <p className="product-title">{product.name}</p>
        </Link>

        <div className="size-dropdown-section">
          <span>
            {!product.customizable && <span className="product-category">{product.category}</span>}
          </span>
          <span>
            {hasSizeOptions && (
              <div className="size-selector">
                {normalizedSizes.map((size, index) => (
                  <span
                    key={`${product.id}-${size}-${index}`}
                    className={`size-option ${selectedSize === size ? "selected" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ [ProductCard] Size clicked:', size, 'Current:', selectedSize);
                      handleSizeChange(size);
                    }}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}
          </span>
        </div>

        <div className="product-details">
          <span className="product-price">Rs. {Math.round(currentPrice)}</span>

          <button 
            className="add-to-cart-button" 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {showRemove && (
            <button
              className="remove-from-wishlist-button"
              onClick={() => removeFromWishlist(product.id)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      </div>

      <style>{`
        .modal-fullscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-fullscreen-content {
          background-color: #fff;
          padding: 40px 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
          text-align: center;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .size-selection {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin: 20px 0;
        }
        .size-btn {
          padding: 10px 15px;
          border-radius: 6px;
          border: 1px solid #ccc;
          background-color: #f8f8f8;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .size-btn:hover {
          background-color: #b8860b;
          color: #fff;
          border-color: #b8860b;
        }
        .size-btn.selected {
          background-color: #b8860b;
          color: #fff;
          border-color: #b8860b;
        }
        .modal-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 20px;
        }
        .confirm-btn {
          flex: 1;
          padding: 10px;
          background-color: #b8860b;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .confirm-btn:hover {
          background-color: #b8860b;
        }
        .cancel-btn {
          flex: 1;
          padding: 10px;
          background-color: #ccc;
          color: #333;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .cancel-btn:hover {
          background-color: #bbb;
        }

        /* Match Filter Sidebar size buttons */
        .size-selector {
          display: flex;
          flex-wrap: wrap;
          /*gap: 8px; */
          gap: 2px !important;
          justify-content: flex-end; /* align similar to dropdown placement */
          margin-top: 5px;
        }

        .size-option {
          display: inline-block;
          /*padding: 6px 12px;*/
          padding: 4px 10px !important;
          border: 1px solid #d1d5db;
          /*border-radius: 6px;
          font-size: 14px;*/
          border-radius: 0px !important;
          font-size: 13px !important;
          font-weight: 500;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .size-option:hover {
          /*background: #724cf9;*/
          color: #fff;
          /*border-color: #724cf9;*/
        }

        .size-option.selected {
          /*background: #724cf9;*/
          color: #fff;
          /*border-color: #724cf9;*/
        }

        /* ---------- Base (Desktop & General) ---------- */
        .size-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: flex-end;
          margin-top: 6px;
        }

        .size-option {
          display: inline-block;
          padding: 6px 14px;
          border: 1px solid #d1d5db;
          border-radius: 20px; /* pill shape */
          font-size: 14px;
          font-weight: 500;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .size-option:hover {
          background: #A1712F;
          color: #fff;
          border-color: #A1712F;
        }

        .size-option.selected {
          background: #A1712F;
          color: #fff;
          border-color: #A1712F;
        }

        /* ---------- Tablet (below 1024px) ---------- */
        @media (max-width: 1024px) {
          .size-selector {
            justify-content: flex-start;
            gap: 8px;
          }

          .size-option {
            font-size: 13px;
            padding: 6px 12px;
          }

          .product-category {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
            
          .size-dropdown-section {
            flex-direction: column;
          }
        }

        /* ---------- Mobile (below 768px) ---------- */
        @media (max-width: 768px) {
          .size-selector {
            justify-content: center; /* center align on smaller screens */
            gap: 6px;
          }

          .size-option {
            font-size: 13px;
            padding: 5px 10px;
            border-radius: 18px;
          }
        }

        /* ---------- Small Mobile (below 480px) ---------- */
        @media (max-width: 480px) {
          .size-selector {
            flex-wrap: wrap;
            justify-content: center;
            gap: 5px;
          }

          .size-option {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 16px;
          }
        }

        @media (max-width: 900px) {
          .product-card {
            height: 100% !important;
            min-height: 340px;
          }
          .product-details {
            margin-top: 8px !important;
          }
          .product-title {
            font-size: 0.8rem !important;
            line-height: 1.25 !important;
          }
        }
        
        /* ---------- Extra Small Mobile (below 445px) ---------- */
        @media (max-width: 445px) {
          .size-selector {
            justify-content: center;
            gap: 4px;
          }

          span.size-option {
            font-size: 11px !important;
            padding: 3px 7px !important;
          }
        }

        @media (max-width: 357px) {
          span.size-option {
            font-size: 10px !important;
            padding: 1px 5px !important;
          }
        }

      `}</style>
    </>
  );
};

export default ProductCard;