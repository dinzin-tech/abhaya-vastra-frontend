import React, { useContext } from "react";
import { WishlistContext } from "../../context/WishlistContext";
import { CartContext } from "../../context/CartContext";
import ProductCard from "../HomePage/ProductCard"; // import your ProductCard
import "./WishlistPage.css";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  const { wishlistItems } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty">
        <h2>Your wishlist is empty</h2>
        <Link to="/" className="shop-now-btn">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-title">Your Wishlist</h1>
      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            showRemove={true} // This adds "Remove from Wishlist" button inside the card
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
