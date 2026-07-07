// import React, { useState, useEffect, useContext } from "react";
// import { CartContext } from "../../context/CartContext";
// import { WishlistContext } from "../../context/WishlistContext";
// import { useParams, useLocation, Link } from "react-router-dom";
// import API from "../../api";
// import "./ProductPage.css";

// const ProductPage = () => {
//   const { name } = useParams();
//   const location = useLocation();

//   const productId = location.state?.id;
//   const customizableFromState = location.state?.customizable ?? false;

//   // --- Dynamic Data States ---
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const isCustomizable = product?.customizable ?? customizableFromState;
//   // ---------------------------

//   // Contexts and Local UI State
//   const { addToCart } = useContext(CartContext);
//   const { addToWishlist, removeFromWishlist, isInWishlist } =
//     useContext(WishlistContext);

//   const [quantity, setQuantity] = useState(1);
//   const [selectedColor, setSelectedColor] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [displayImages, setDisplayImages] = useState([]);
//   const [mainImage, setMainImage] = useState("");
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [currentDiscountedPrice, setCurrentDiscountedPrice] = useState(0);

//   const [productDetailsOpen, setProductDetailsOpen] = useState(true);
//   const [zoomState, setZoomState] = useState({
//     isZoomed: false,
//     transformOrigin: "50% 50%",
//   });

//   // --- Price Calculation Function ---
//   const getVariantPrice = () => {
//     console.log('🔍 getVariantPrice called', {
//       isCustomizable,
//       hasProduct: !!product,
//       hasVariants: product?.variants?.length > 0,
//       selectedSize,
//       selectedColor
//     });

//     if (isCustomizable || !product || !product.variants || product.variants.length === 0) {
//       console.log('⚠️ No variants, using base price');
//       return {
//         price: product?.price || 0,
//         discountedPrice: product?.total_price || product?.price || 0,
//         discount: 0
//       };
//     }

//     const selectedColorId = product.colors?.find((c) => c.color === selectedColor)?.id;
//     console.log('🎨 Selected color ID:', selectedColorId);
    
//     // Priority 1: Find variant by size AND color
//     if (selectedSize && selectedColorId) {
//       const variant = product.variants.find(
//         (v) => v.size === selectedSize && v.color_id === selectedColorId
//       );
      
//       if (variant) {
//         console.log('✅ Found variant (size + color):', variant);
//         return {
//           price: variant.price || 0,
//           discountedPrice: variant.total_price || variant.price || 0,
//           discount: variant.discount || 0
//         };
//       }
//     }
    
//     // Priority 2: Find variant by size only
//     if (selectedSize) {
//       const variant = product.variants.find((v) => v.size === selectedSize);
//       if (variant) {
//         console.log('✅ Found variant (size only):', variant);
//         return {
//           price: variant.price || 0,
//           discountedPrice: variant.total_price || variant.price || 0,
//           discount: variant.discount || 0
//         };
//       } else {
//         console.log('❌ No variant found for size:', selectedSize);
//       }
//     }
    
//     // Fallback to first variant or base price
//     if (product.variants.length > 0) {
//       const firstVariant = product.variants[0];
//       console.log('⚠️ Using first variant as fallback:', firstVariant);
//       return {
//         price: firstVariant.price || 0,
//         discountedPrice: firstVariant.total_price || firstVariant.price || 0,
//         discount: firstVariant.discount || 0
//       };
//     }
    
//     console.log('⚠️ Using base price fallback');
//     return {
//       price: product.price || 0,
//       discountedPrice: product.total_price || product.price || 0,
//       discount: 0
//     };
//   };

//   // --- Stock Lookup Function ---
//   const getAvailableStock = () => {
//     if (isCustomizable || !product || !product.variants) {
//       return 999;
//     }
    
//     const selectedColorId = product.colors?.find((c) => c.color === selectedColor)?.id;
    
//     if (selectedSize && selectedColorId) {
//       const variant = product.variants.find(
//         (v) => v.size === selectedSize && v.color_id === selectedColorId
//       );
//       return variant ? variant.stock : 0;
//     }
    
//     if (selectedSize) {
//       const stock = product.variants
//         .filter((v) => v.size === selectedSize)
//         .reduce((total, v) => total + (v.stock || 0), 0);
//       return stock;
//     }
    
//     if (selectedColorId) {
//       const stock = product.variants
//         .filter((v) => v.color_id === selectedColorId)
//         .reduce((total, v) => total + (v.stock || 0), 0);
//       return stock;
//     }
    
//     const totalStock = product.variants.reduce((total, v) => total + (v.stock || 0), 0);
//     return totalStock;
//   };

//   const availableStock = getAvailableStock();
//   const isOutOfStock = availableStock <= 0;
//   // -----------------------------

//   // --- Update prices when size or color changes ---
//   useEffect(() => {
//     if (product && !isCustomizable) {
//       const priceData = getVariantPrice();
//       console.log('Price update:', {
//         selectedSize,
//         selectedColor,
//         price: priceData.price,
//         discountedPrice: priceData.discountedPrice
//       });
//       setCurrentPrice(priceData.price);
//       setCurrentDiscountedPrice(priceData.discountedPrice);
//     }
//   }, [selectedSize, selectedColor, product]);

//   // --- Dynamic Data Fetching Effect ---
//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       if (!productId && !name) {
//         setError("Product ID is missing.");
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         const endpoint = `/products/${name}?customizable=${customizableFromState}`;
//         const res = await API.get(endpoint);

//         if (res.data.success) {
//           const fetchedData = res.data.data;
//           console.log('✅ Product fetched:', fetchedData);
//           console.log('✅ Variants:', fetchedData.variants);
//           console.log('✅ Sizes:', fetchedData.sizes);
//           setProduct(fetchedData);

//           const initialSize = fetchedData.sizes?.[0] || "";
//           console.log('✅ Initial size selected:', initialSize);
//           setSelectedSize(initialSize);

//           if (fetchedData.customizable) {
//             setDisplayImages(fetchedData.multipleImages || []);
//             setMainImage(fetchedData.multipleImages?.[0] || "");
//             setSelectedColor("");
//           } else {
//             const initialColor = fetchedData.colors?.[0]?.color || "";
//             setSelectedColor(initialColor);

//             if (fetchedData.colors && fetchedData.colors.length > 0) {
//               const initialColorItem = fetchedData.colors[0];
//               setDisplayImages(initialColorItem.images || []);
//               setMainImage(initialColorItem.images?.[0] || "");
//             } else {
//               setDisplayImages(fetchedData.multipleImages || []);
//               setMainImage(fetchedData.multipleImages?.[0] || "");
//             }
//           }
//         } else {
//           setError(res.data.message || "Failed to fetch product details.");
//         }
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.message ||
//           err.message ||
//           "An error occurred while fetching product details.";
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductDetails();
//   }, [productId, name, customizableFromState]);

//   // --- UI Handlers ---
//   const handleChange = (e) => {
//     const value = parseInt(e.target.value);
//     const max = getAvailableStock();
//     setQuantity(value > 0 ? Math.min(value, max) : 1);
//   };


//   const handleSizeSelect = (size) => {
//     console.log('Size selected:', size);
//     setSelectedSize(size);
    
//     // Update quantity based on stock
//     setQuantity((q) => {
//       const selectedColorId = product.colors?.find((c) => c.color === selectedColor)?.id;
//       const variant = product.variants?.find(
//         (v) => v.size === size && v.color_id === selectedColorId
//       );
//       const newMaxStock = variant?.stock || 0;
//       return Math.min(q, newMaxStock || 1);
//     });
//   };

//   const handleColorSelect = (color) => {
//     if (isCustomizable || !product || !product.colors) {
//       setSelectedColor(color);
//       return;
//     }

//     setSelectedColor(color);
//     const colorItem = product.colors.find((c) => c.color === color);

//     if (colorItem && colorItem.images.length > 0) {
//       setDisplayImages(colorItem.images);
//       setMainImage(colorItem.images[0]);
//     } else {
//       setDisplayImages(product.multipleImages || []);
//       setMainImage(product.multipleImages?.[0] || "");
//     }
//   };

//   const handleMouseMove = (e) => {
//     const { left, top, width, height } =
//       e.currentTarget.getBoundingClientRect();
//     const x = ((e.pageX - left) / width) * 100;
//     const y = ((e.pageY - top) / height) * 100;
//     setZoomState((prev) => ({ ...prev, transformOrigin: `${x}% ${y}%` }));
//   };

//   const handleWishlistClick = () => {
//     if (!product) return;

//     const wishlistItem = {
//       ...product,
//       image: product.image || product.multipleImages?.[0] || "",
//       hoverImage:
//         product.hoverImage ||
//         product.multipleImages?.[1] ||
//         product.image ||
//         "",
//       selectedSize: selectedSize || "",
//       selectedColor: selectedColor || "",
//       quantity: quantity || 1,
//     };

//     if (isInWishlist(product.id)) {
//       removeFromWishlist(product.id);
//     } else {
//       addToWishlist(wishlistItem);
//     }
//   };
//   // ---------------------------------

//   // --- Loading/Error/NotFound States ---
//   if (loading) {
//     return <div className="loading-state">Loading product details...</div>;
//   }

//   if (error) {
//     return <div className="error-state">Error: {error}</div>;
//   }

//   if (!product) {
//     return <div className="not-found-state">Product not found.</div>;
//   }
//   // ---------------------------------

//   return (
//     <div className="product-page-container">
//       <div
//         className={`product-display-grid ${
//           isCustomizable ? "customizable-layout" : ""
//         }`}
//       >
//         {/* === Image Gallery === */}
//         <div className="image-gallery-container">
//           <div
//             className="main-product-image-container"
//             onMouseEnter={() =>
//               setZoomState((prev) => ({ ...prev, isZoomed: true }))
//             }
//             onMouseLeave={() =>
//               setZoomState((prev) => ({ ...prev, isZoomed: false }))
//             }
//             onMouseMove={handleMouseMove}
//           >
//             <img
//               src={mainImage}
//               alt={product.name}
//               className="main-product-image"
//               style={{
//                 transform: zoomState.isZoomed ? "scale(1.5)" : "scale(1)",
//                 transformOrigin: zoomState.transformOrigin,
//               }}
//             />
//           </div>
//           <div className="product-thumbnails">
//             {displayImages?.map((img, i) => (
//               <img
//                 key={i}
//                 src={img}
//                 alt={`View ${i + 1}`}
//                 className={`thumbnail-image ${
//                   mainImage === img ? "selected" : ""
//                 }`}
//                 onClick={() => setMainImage(img)}
//               />
//             ))}
//           </div>
//         </div>

//         {/* === Product Details === */}
//         <div className="product-details-content">
//           <h1 className="product-name">{product.name}</h1>

//           {!isCustomizable && (
//             <>
//               <div className="product-price-container">
//                 {product.discount > 0 ? (
//                   <>
//                     <p className="product-price original-price-line">
//                       ₹ {Math.round(currentPrice)}
//                     </p>
//                     <p className="product-price discounted-price-main">
//                       ₹ {Math.round(currentDiscountedPrice)}
//                     </p>
//                     <span className="discount-badge-detail">
//                       {Math.round(product.discount)}% OFF
//                     </span>
//                   </>
//                 ) : (
//                   <p className="product-price">
//                     ₹ {Math.round(currentDiscountedPrice || currentPrice)}
//                   </p>
//                 )}
//               </div>

//               {/* Colors */}
//               {product.colors && product.colors.length > 0 && (
//                 <>
//                   <p className="option-title">Color:</p>
//                   <div className="options-container">
//                     {product.colors.map((colorItem) => (
//                       <button
//                         key={colorItem.color}
//                         className={`color-button ${
//                           selectedColor === colorItem.color ? "selected" : ""
//                         }`}
//                         style={{ backgroundColor: colorItem.color }}
//                         onClick={() => handleColorSelect(colorItem.color)}
//                       />
//                     ))}
//                   </div>
//                 </>
//               )}

//               {/* Sizes */}
//               {product.sizes && product.sizes.length > 0 && (
//                 <>
//                   <p className="option-title">Size:</p>
//                   <div className="options-container">
//                     {product.sizes.map((size, index) => (
//                       <button
//                         key={`size-${size}-${index}`}
//                         type="button"
//                         className={`size-button ${
//                           selectedSize === size ? "selected" : ""
//                         }`}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           console.log('🖱️ [ProductPage] Size button clicked:', size);
//                           handleSizeSelect(size);
//                         }}
//                         style={{
//                           cursor: 'pointer',
//                           pointerEvents: 'auto'
//                         }}
//                       >
//                         {size}
//                       </button>
//                     ))}
//                   </div>
//                 </>
//               )}

//               {/* Quantity */}
//               <div className="quantity-action-container">
//                 <div>
//                   <p className="option-title">Quantity</p>
//                   <input
//                     type="number"
//                     min="1"
//                     max={availableStock}
//                     value={quantity}
//                     onChange={handleChange}
//                     className="quantity-selector"
//                     disabled={isOutOfStock}
//                   />
//                 </div>

//                 <div className="action-buttons">
//                   <button
//                     className="add-to-cart-button"
//                     onClick={() => {
//                       const cartItem = {
//                         ...product,
//                         image: product.image || product.multipleImages?.[0] || "",
//                         hoverImage:
//                           product.hoverImage ||
//                           product.multipleImages?.[1] ||
//                           product.image ||
//                           "",
//                         selectedSize: selectedSize || "",
//                         selectedColor: selectedColor || "",
//                         quantity: quantity || 1,
//                       };
//                       addToCart(cartItem, quantity, selectedSize);
//                     }}
//                     disabled={isOutOfStock || !selectedSize || !selectedColor}
//                   >
//                     {isOutOfStock ? "Sold Out" : "Add to Cart"}
//                   </button>
//                   <button
//                     onClick={handleWishlistClick}
//                     className="wishlist-button"
//                     style={{
//                       background: "none",
//                       border: "none",
//                       fontSize: "1.5rem",
//                       cursor: "pointer",
//                       color: isInWishlist(product.id) ? "red" : "gray",
//                     }}
//                   >
//                     ❤
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Product Details Toggle */}
//           {!isCustomizable && (
//             <div className="product-details-toggle">
//               <div
//                 className="product-details-header"
//                 onClick={() => setProductDetailsOpen(!productDetailsOpen)}
//               >
//                 <span>Product Details</span>
//                 <span>{productDetailsOpen ? "▲" : "▼"}</span>
//               </div>
//               {productDetailsOpen && (
//                 <div className="product-details-content-body">
//                   <p>
//                     <strong>Category:</strong> {product.category} |{" "}
//                     <strong>Gender:</strong> {product.gender}
//                   </p>
//                   <p>
//                     <strong>Description:</strong>
//                     <br />
//                     {product.description}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Customizable Product */}
//           {isCustomizable && (
//             <div className="customization-panel">
//               <div className="product-details-content-body">
//                 <h2>Product Description:</h2>
//                 <p>{product.description}</p>
//                 {product.custom_options &&
//                   product.custom_options.length > 0 && (
//                     <div className="custom-options-list">
//                       {product.custom_options.map((option) => (
//                         <div key={option.id} className="custom-option-item">
//                           <h4>{option.title}</h4>
//                           <p>{option.description}</p>
//                           <Link to="/contact">
//                             <button className="contact-us-button">
//                               Contact Us
//                             </button>
//                           </Link>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductPage;



import React, { useState, useEffect, useRef, useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { useParams, useLocation, Link } from "react-router-dom";
import API from "../../api";
import "./ProductPage.css";
import { Helmet } from "react-helmet-async";

const ProductPage = () => {
  const { name } = useParams();
  const location = useLocation();

  const productId = location.state?.id;
  const customizableFromState = location.state?.customizable ?? false;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isCustomizable = product?.customizable ?? customizableFromState;

  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useContext(WishlistContext);

  // === New States ===
  const [quantity, setQuantity] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState("");
  const shareRef = useRef(null);

  // === Reviews States ===
  const [isEligible, setIsEligible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  // ===================

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [displayImages, setDisplayImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentDiscountedPrice, setCurrentDiscountedPrice] = useState(0);

  const [productDetailsOpen, setProductDetailsOpen] = useState(true);
  const [zoomState, setZoomState] = useState({
    isZoomed: false,
    transformOrigin: "50% 50%",
  });

  // --- Stock/Variant logic (same as before) ---
  const getVariantPrice = () => {
    if (isCustomizable || !product || !product.variants) {
      return {
        price: product?.price || 0,
        discountedPrice: product?.total_price || product?.price || 0,
      };
    }
    const selectedColorId = product.colors?.find(
      (c) => c.color === selectedColor
    )?.id;
    const variant = product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (!selectedColorId || v.color_id === selectedColorId)
    );
    return {
      price: variant?.price || product.price,
      discountedPrice: variant?.total_price || variant?.price || product.price,
    };
  };

  const getAvailableStock = () => {
    if (isCustomizable || !product?.variants) return 999;
    const selectedColorId = product.colors?.find(
      (c) => c.color === selectedColor
    )?.id;
    const variant = product.variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColorId || v.color_id === selectedColorId)
    );
    return variant?.stock || 0;
  };

  const availableStock = getAvailableStock();
  const isOutOfStock = availableStock <= 0;

  useEffect(() => {
    if (product && !isCustomizable) {
      const { price, discountedPrice } = getVariantPrice();
      setCurrentPrice(price);
      setCurrentDiscountedPrice(discountedPrice);
    }
  }, [selectedSize, selectedColor, product]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await API.get(
          `/products/${name}?customizable=${customizableFromState}`
        );
        if (res.data.success) {
          const fetchedData = res.data.data;
          setProduct(fetchedData);
          const initialSize = fetchedData.sizes?.[0] || "";
          const initialColor = fetchedData.colors?.[0]?.color || "";
          setSelectedSize(initialSize);
          setSelectedColor(initialColor);
          setDisplayImages(
            fetchedData.colors?.[0]?.images || fetchedData.multipleImages || []
          );
          setMainImage(
            fetchedData.colors?.[0]?.images?.[0] ||
              fetchedData.multipleImages?.[0] ||
              ""
          );
        } else {
          setError("Failed to fetch product details");
        }
      } catch (err) {
        setError("Error fetching product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [name, customizableFromState]);

  // === Reviews Eligibility & Form Handlers ===
  useEffect(() => {
    const checkEligibility = async () => {
      if (!product?.id) return;
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const res = await API.get(`/products/${product.id}/review-eligibility`);
        setIsEligible(res.data.eligible);
      } catch (err) {
        console.error("Error checking review eligibility:", err);
      }
    };
    checkEligibility();
  }, [product]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size <= 500 * 1024) {
      setReviewImage(file);
      setImagePreview(URL.createObjectURL(file));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let q = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob.size <= 500 * 1024 || q <= 0.2) {
              const compressed = new File([blob], file.name, { type: "image/jpeg" });
              setReviewImage(compressed);
              setImagePreview(URL.createObjectURL(compressed));
            } else {
              q -= 0.1;
              tryCompress();
            }
          }, "image/jpeg", q);
        };
        tryCompress();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setSubmitError("Please write a comment.");
      return;
    }

    setSubmittingReview(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const formData = new FormData();
      formData.append("rating", newRating);
      formData.append("review", newComment);
      if (reviewImage) {
        formData.append("image", reviewImage);
      }

      const res = await API.post(`/products/${product.id}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setSubmitSuccess("Review submitted successfully!");
        setNewComment("");
        setReviewImage(null);
        setImagePreview(null);
        setIsEligible(false); // Disable form

        // Prepend review to product's reviews
        setProduct((prev) => ({
          ...prev,
          reviews: [res.data.data, ...(prev.reviews || [])],
        }));
      } else {
        setSubmitError(res.data.message || "Failed to submit review.");
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "An error occurred while submitting."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // === Share feature logic ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const productUrl = window.location.href;
  const whatsappMessage = `🔥 Check this out: ${product?.name} 👉 ${productUrl}`;

  const handleWhatsAppShare = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );
    setShowShare(false);
  };
  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        productUrl
      )}`,
      "_blank"
    );
    setShowShare(false);
  };
  const handleInstagramShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: `Check this out: ${product?.name}`,
          url: productUrl,
        });
      } else {
        await navigator.clipboard.writeText(productUrl);
        setCopiedMsg("Link copied — paste in Instagram");
      }
    } catch {
      await navigator.clipboard.writeText(productUrl);
      setCopiedMsg("Link copied — paste in Instagram");
    } finally {
      setShowShare(false);
      setTimeout(() => setCopiedMsg(""), 2200);
    }
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedMsg("Link copied to clipboard");
    } catch {
      setCopiedMsg("Copy failed");
    }
    setShowShare(false);
    setTimeout(() => setCopiedMsg(""), 2200);
  };

  const handleWishlistClick = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!product) return <div className="not-found-state">Product not found</div>;

  return (
    <>
      <Helmet>
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description?.slice(0, 150)} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="product-page-container">
      <div className={`product-display-grid ${isCustomizable ? "customizable-layout" : ""}`}>
        <div className="image-gallery-container">
          <div
            className="main-product-image-container"
            onMouseEnter={() =>
              setZoomState((prev) => ({ ...prev, isZoomed: true }))
            }
            onMouseLeave={() =>
              setZoomState((prev) => ({ ...prev, isZoomed: false }))
            }
            onMouseMove={(e) => {
              const { left, top, width, height } =
                e.currentTarget.getBoundingClientRect();
              const x = ((e.pageX - left) / width) * 100;
              const y = ((e.pageY - top) / height) * 100;
              setZoomState((prev) => ({
                ...prev,
                transformOrigin: `${x}% ${y}%`,
              }));
            }}
          >
            <img
              src={mainImage}
              alt={product.name}
              className="main-product-image"
              style={{
                transform: zoomState.isZoomed ? "scale(1.5)" : "scale(1)",
                transformOrigin: zoomState.transformOrigin,
              }}
            />
          </div>
          <div className="product-thumbnails">
            {displayImages?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`View ${i + 1}`}
                className={`thumbnail-image ${
                  mainImage === img ? "selected" : ""
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="product-details-content">
          <h1 className="product-name">{product.name}</h1>

          <div className="product-price-container">
            {product.discount > 0 ? (
              <>
                <p className="product-price original-price-line">
                  ₹ {Math.round(currentPrice)}
                </p>
                <p className="product-price discounted-price-main">
                  ₹ {Math.round(currentDiscountedPrice)}
                </p>
                <span className="discount-badge-detail">
                  {Math.round(product.discount)}% OFF
                </span>
              </>
            ) : (
              <p className="product-price">
                ₹ {Math.round(currentDiscountedPrice || currentPrice)}
              </p>
            )}
          </div>

          {!isCustomizable && (
              <>
                {product.colors && (
                  <>
                    <p className="option-title">Color:</p>
                    <div className="options-container">
                      {product.colors.map((color) => (
                        <button
                          key={color.name || color}
                          className={`color-button ${
                            selectedColor === (color.name || color) ? 'selected' : ''
                          }`}
                          style={{ backgroundColor: color.hex || color }}
                          onClick={() => setSelectedColor(color.name || color)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {product.sizes && (
                  <>
                    <p className="option-title">Size:</p>
                    <div className="options-container">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
          )}

          {/* === Buttons Row === */}
          <div className="product-options-row">
            <div>
              <p className="option-title">Quantity</p>
              <select
                className="quantity-select"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={12}>12</option>
              </select>
            </div>

            <button
              className="add-to-cart-button"
              onClick={() =>
                addToCart(product, quantity, selectedSize || "")
              }
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Sold Out" : "Add to Cart"}
            </button>

            <button
              onClick={handleWishlistClick}
              className={`wishlist-button ${isInWishlist(product.id) ? "active" : ""}`}
            >
              ❤
            </button>

            <div className="share-wrapper" ref={shareRef}>
              <button
                className="share-btn"
                onClick={() => setShowShare((s) => !s)}
                title="Share"
              >
                <i className="fa-solid fa-share-nodes" />
              </button>

              {showShare && (
                <div className="share-popup">
                  <div className="share-item" onClick={handleWhatsAppShare}>
                    <i className="fa-brands fa-whatsapp" /> WhatsApp
                  </div>
                  <div className="share-item" onClick={handleFacebookShare}>
                    <i className="fa-brands fa-facebook" /> Facebook
                  </div>
                  <div className="share-item" onClick={handleInstagramShare}>
                    <i className="fa-brands fa-instagram" /> Instagram
                  </div>
                  <div className="share-item" onClick={handleCopyLink}>
                    <i className="fa-solid fa-link" /> Copy Link
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === Description Section === */}
          <div className="product-details-toggle">
            <div
              className="product-details-header"
              onClick={() => setProductDetailsOpen(!productDetailsOpen)}
            >
              <span>Product Details</span>
              <span>{productDetailsOpen ? "▲" : "▼"}</span>
            </div>
            {productDetailsOpen && (
              <div className="product-details-content-body">
                <p>
                  <strong>Category:</strong> {product.category} |{" "}
                  <strong>Gender:</strong> {product.gender}
                </p>
                <p>
                  <strong>Description:</strong>
                  <br />
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Reviews Section === */}
      {!isCustomizable && (
        <div className="product-reviews-container">
          <h2 className="reviews-section-title">Customer Reviews</h2>
          
          <div className="reviews-layout-grid">
            {/* Reviews Summary Card */}
            <div className="reviews-summary-card">
              <div className="rating-avg-score">
                {product.reviews && product.reviews.length > 0
                  ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
                  : "0.0"}
              </div>
              <div className="rating-avg-stars">
                {Array.from({ length: 5 }).map((_, i) => {
                  const avg = product.reviews && product.reviews.length > 0
                    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                    : 0;
                  return (
                    <i
                      key={i}
                      className={`fa-solid fa-star ${i < Math.round(avg) ? "star-active" : "star-inactive"}`}
                    />
                  );
                })}
              </div>
              <div className="rating-summary-text">
                Based on {product.reviews?.length || 0} reviews
              </div>
            </div>

            {/* Reviews list */}
            <div className="reviews-list-box">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="reviewer-profile">
                        <div className="reviewer-avatar">
                          <span>{rev.name ? rev.name.charAt(0).toUpperCase() : "U"}</span>
                        </div>
                        <div className="reviewer-meta">
                          <span className="reviewer-name">{rev.name}</span>
                          <div className="reviewer-rating-stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i
                                key={i}
                                className={`fa-solid fa-star ${i < rev.rating ? "star-active" : "star-inactive"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="review-timestamp">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="review-comment-text">{rev.review}</p>
                    {rev.image && (
                      <div className="review-attached-photo">
                        <img 
                          src={rev.image.startsWith("http") ? rev.image : `${API.defaults.baseURL.replace("/api", "")}/storage/${rev.image}`} 
                          alt="Review attachment" 
                          onClick={() => window.open(rev.image.startsWith("http") ? rev.image : `${API.defaults.baseURL.replace("/api", "")}/storage/${rev.image}`, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-reviews-box">
                  <p>No reviews yet for this product. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>

          {/* Write a Review Block */}
          {isEligible && (
            <div className="write-review-wrapper">
              <h3>Write a Review</h3>
              <p className="write-review-intro">Share your rating and thoughts with other customers.</p>
              
              {submitError && <div className="review-alert error">{submitError}</div>}
              {submitSuccess && <div className="review-alert success">{submitSuccess}</div>}

              <form onSubmit={handleSubmitReview} className="write-review-form">
                <div className="write-form-group">
                  <label>Overall Rating</label>
                  <div className="rating-selector-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-select-button ${newRating >= star ? "active" : ""}`}
                        onClick={() => setNewRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="write-form-group">
                  <label htmlFor="review_input">Review Message</label>
                  <textarea
                    id="review_input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your review comments here..."
                    required
                  />
                </div>

                <div className="write-form-group">
                  <label>Add Photo (Optional)</label>
                  <div className="review-photo-selector">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <div className="selector-prompt">
                      <span>📷 Select Image</span>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="review-image-preview-container">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" className="remove-preview-image" onClick={() => { setReviewImage(null); setImagePreview(null); }}>✕</button>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={submittingReview} className="submit-review-btn">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>

    {copiedMsg && <div className="copied-toast">{copiedMsg}</div>}
  </>
);
};

export default ProductPage;
