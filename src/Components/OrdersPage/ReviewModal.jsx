import React, { useState } from "react";
import API from "../../api";
import "./ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, productId, productName, productImage }) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }
      setImage(file);
      setError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a review comment.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("review", comment);
      if (image) {
        formData.append("image", image);
      }

      const res = await API.post(`/products/${productId}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setSuccess("Thank you! Your review has been submitted successfully.");
        setComment("");
        setImage(null);
        setImagePreview(null);
        setRating(5);
        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 2000);
      } else {
        setError(res.data.message || "Failed to submit review.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while submitting."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rmodal-overlay" onClick={onClose}>
      <div className="rmodal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rmodal-header">
          <div className="rmodal-header-title">
            <span className="rmodal-header-icon">⭐</span>
            <h3>Write a Product Review</h3>
          </div>
          <button className="rmodal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Product Card */}
        <div className="rmodal-product-card">
          <img src={productImage} alt={productName} className="rmodal-product-img" />
          <div className="rmodal-product-info">
            <span className="rmodal-product-badge">Reviewing</span>
            <h4 className="rmodal-product-name">{productName}</h4>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="rmodal-body">
          {error && <div className="rmodal-alert rmodal-alert--error">{error}</div>}
          {success && <div className="rmodal-alert rmodal-alert--success">{success}</div>}

          {/* Star selector */}
          <div className="rmodal-form-group text-center">
            <label className="rmodal-label">How would you rate this product?</label>
            <div className="rmodal-stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`rmodal-star-btn ${
                    star <= (hoverRating || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="rmodal-rating-desc">
              {rating === 1 && "Poor 😞"}
              {rating === 2 && "Fair 😐"}
              {rating === 3 && "Good 🙂"}
              {rating === 4 && "Very Good 😄"}
              {rating === 5 && "Excellent! 😍"}
            </span>
          </div>

          {/* Comment Box */}
          <div className="rmodal-form-group">
            <label className="rmodal-label" htmlFor="review-comment">Share your feedback</label>
            <textarea
              id="review-comment"
              className="rmodal-textarea"
              rows="4"
              placeholder="What did you like or dislike? How was the fabric and size quality?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength="500"
              disabled={submitting || success}
            />
            <div className="rmodal-char-count">{comment.length}/500 characters</div>
          </div>

          {/* Photo upload */}
          <div className="rmodal-form-group">
            <label className="rmodal-label">Add a Photo (Optional)</label>
            
            {!imagePreview ? (
              <label className="rmodal-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={submitting || success}
                />
                <span className="rmodal-upload-icon">📷</span>
                <span className="rmodal-upload-text">Click to upload product photo</span>
                <span className="rmodal-upload-hint">Max size 2MB (JPEG, PNG)</span>
              </label>
            ) : (
              <div className="rmodal-preview-container">
                <img src={imagePreview} alt="Review Preview" className="rmodal-image-preview" />
                <button
                  type="button"
                  className="rmodal-remove-image-btn"
                  onClick={handleRemoveImage}
                  disabled={submitting}
                >
                  ✕ Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="rmodal-footer">
            <button
              type="button"
              className="rmodal-btn rmodal-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rmodal-btn rmodal-btn--primary"
              disabled={submitting || success}
            >
              {submitting ? (
                <>
                  <span className="rmodal-spinner"></span> Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
