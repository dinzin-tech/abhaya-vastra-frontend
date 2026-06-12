import React, { useState, useRef, useEffect } from 'react';
import API from '../../api';
import './ExchangeModal.css';

const ExchangeModal = ({ order, isOpen, onClose, onExchangeSubmitted }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState('');
  const [exchangeSize, setExchangeSize] = useState('');
  const [exchangeColor, setExchangeColor] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedExchange, setSubmittedExchange] = useState(null);
  const [loadingExchange, setLoadingExchange] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && order) {
      console.log('🔍 Order received:', order);
      console.log('📦 Order items:', order.items);
      
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
      console.log('🎯 First item:', firstItem);
      
      setSelectedItem(firstItem);
      setReason('');
      setExchangeSize('');
      setExchangeColor('');
      setImages([]);
      setImagePreviews([]);
      setError('');
      setIsSubmitted(false);
      setSubmittedExchange(null);
      setDragOver(false);

      // Fetch product details
      if (firstItem?.id || firstItem?.product_id) {
        const productId = firstItem.id || firstItem.product_id;
        console.log('🔑 Using product ID:', productId, 'from firstItem.id:', firstItem.id, 'or firstItem.product_id:', firstItem.product_id);
        fetchProductDetails(productId);
      } else {
        console.error('❌ No product ID found in item:', firstItem);
      }

      // Fetch existing exchange request for this order
      fetchExistingExchange();
    }
  }, [isOpen, order?.id]);

  const fetchExistingExchange = async () => {
    if (!order?.id) return;

    setLoadingExchange(true);
    try {
      const response = await API.get(`/exchanges`);
      if (response.data.success && response.data.data.length > 0) {
        const existingExchange = response.data.data.find(ex => ex.order_id === order.id);
        if (existingExchange) {
          setIsSubmitted(true);
          setSubmittedExchange(existingExchange);
        }
      }
    } catch (err) {
      console.error('Error fetching existing exchange:', err);
    } finally {
      setLoadingExchange(false);
    }
  };

  const fetchProductDetails = async (productId) => {
    console.log('Fetching product details for ID:', productId);
    setLoadingProduct(true);
    try {
      const response = await API.get(`/products/${productId}`);
      console.log('Product API Response:', response.data);
      
      if (response.data.success) {
        const product = response.data.data;
        console.log('Product Data:', product);
        setProductDetails(product);
        
        // Extract unique sizes from variants
        if (product.variants && product.variants.length > 0) {
          const sizes = [...new Set(product.variants.map(v => v.size))].filter(Boolean);
          console.log('Available Sizes:', sizes);
          setAvailableSizes(sizes);
        } else {
          console.log('No variants found for product');
        }
        
        // Extract colors from product_colors
        if (product.colors && product.colors.length > 0) {
          console.log('Available Colors:', product.colors);
          setAvailableColors(product.colors);
        } else {
          console.log('No colors found for product');
        }
      } else {
        console.error('Product fetch failed:', response.data);
        setError('Product details not available');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load product details. Product may not exist.');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== fileArray.length) {
      setError('Please select only image files');
      return;
    }

    if (images.length + validFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const handleFileInputChange = (e) => {
    handleImageUpload(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (exchangeId) => {
    try {
      setPaymentProcessing(true);
      setError('');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        return;
      }

      // Create payment order
      const orderResponse = await API.post(`/exchanges/${exchangeId}/create-payment-order`);
      
      if (!orderResponse.data.success) {
        setError(orderResponse.data.message || 'Failed to create payment order');
        return;
      }

      const { order_id, amount, currency, key } = orderResponse.data.data;

      const options = {
        key: key,
        amount: amount * 100,
        currency: currency,
        name: 'Exchange Charge',
        description: `Exchange charge for Order #${order.order_number}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await API.post(`/exchanges/${exchangeId}/verify-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setIsSubmitted(true);
              setSubmittedExchange(verifyResponse.data.data);
              onExchangeSubmitted();
              setPaymentProcessing(false);
            } else {
              setError('Payment verification failed');
              setPaymentProcessing(false);
            }
          } catch (err) {
            setError('Payment verification failed');
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: order.name,
          email: order.email,
          contact: order.phone
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            setPaymentProcessing(false);
            setError('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedItem) {
      setError('Please select an item to exchange');
      setLoading(false);
      return;
    }

    // Validate that size or color is different
    const originalSize = selectedItem.size || selectedItem.selectedSize || '';
    const originalColor = selectedItem.color || '';
    
    if (exchangeSize === originalSize && exchangeColor === originalColor) {
      setError('Please select a different size or color for exchange');
      setLoading(false);
      return;
    }

    try {
      const exchangeData = {
        order_id: order.id,
        product_id: selectedItem.id || selectedItem.product_id,
        original_size: originalSize,
        original_color: originalColor,
        exchange_size: exchangeSize || originalSize,
        exchange_color: exchangeColor || originalColor,
        reason,
        images: imagePreviews
      };

      const response = await API.post('/exchanges', exchangeData);

      if (response.data.success) {
        const exchangeId = response.data.data.id;
        // Proceed to payment
        await handlePayment(exchangeId);
      } else {
        setError(response.data.message || 'Failed to submit exchange request');
      }
    } catch (err) {
      console.error('Error submitting exchange request:', err);
      setError(err.response?.data?.message || 'Failed to submit exchange request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setReason('');
    setExchangeSize('');
    setExchangeColor('');
    setImages([]);
    setImagePreviews([]);
    setError('');
    setIsSubmitted(false);
    setSubmittedExchange(null);
    onClose();
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'pickup_scheduled': 'status-info',
      'picked_up': 'status-info',
      'exchange_shipped': 'status-info',
      'completed': 'status-completed',
      'cancelled': 'status-rejected'
    };
    return statusClasses[status] || 'status-pending';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'pickup_scheduled': 'Pickup Scheduled',
      'picked_up': 'Picked Up',
      'exchange_shipped': 'Exchange Shipped',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-contents exchange-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isSubmitted ? 'Exchange Request Details' : 'Submit Exchange Request'}</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {loadingExchange ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading exchange request details...</p>
            </div>
          ) : isSubmitted && submittedExchange ? (
            <div className="exchange-details-view">
              <div className="exchange-summary">
                <h4>Exchange Request Details</h4>
                <p>Your exchange request information and current status.</p>
              </div>

              <div className="exchange-info-card">
                <div className="exchange-info-header">
                  <h5>Exchange Request Information</h5>
                  <span className={`status-badge ${getStatusBadgeClass(submittedExchange.status)}`}>
                    {getStatusLabel(submittedExchange.status)}
                  </span>
                </div>

                <div className="exchange-details-grid">
                  <div className="detail-item">
                    <label>Original Size:</label>
                    <p>{submittedExchange.original_size}</p>
                  </div>

                  <div className="detail-item">
                    <label>Exchange Size:</label>
                    <p>{submittedExchange.exchange_size}</p>
                  </div>

                  {submittedExchange.original_color && (
                    <div className="detail-item">
                      <label>Original Color:</label>
                      <p>{submittedExchange.original_color}</p>
                    </div>
                  )}

                  {submittedExchange.exchange_color && (
                    <div className="detail-item">
                      <label>Exchange Color:</label>
                      <p>{submittedExchange.exchange_color}</p>
                    </div>
                  )}

                  <div className="detail-item">
                    <label>Exchange Charge:</label>
                    <p>₹{submittedExchange.exchange_charge}</p>
                  </div>

                  <div className="detail-item">
                    <label>Payment Status:</label>
                    <span className={`payment-badge payment-${submittedExchange.payment_status}`}>
                      {submittedExchange.payment_status.toUpperCase()}
                    </span>
                  </div>

                  <div className="detail-item full-width">
                    <label>Reason:</label>
                    <p>{submittedExchange.reason}</p>
                  </div>

                  <div className="detail-item">
                    <label>Submitted On:</label>
                    <p>{new Date(submittedExchange.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>

                  {submittedExchange.admin_note && (
                    <div className="detail-item full-width">
                      <label>Admin Note:</label>
                      <div className="admin-note-box">
                        <p>{submittedExchange.admin_note}</p>
                      </div>
                    </div>
                  )}

                  {submittedExchange.shiprocket_pickup_awb_code && (
                    <div className="detail-item full-width">
                      <div className="pickup-info-box">
                        <h5>Pickup Details (Original Product)</h5>
                        <p><strong>AWB Code:</strong> {submittedExchange.shiprocket_pickup_awb_code}</p>
                        <p><strong>Courier:</strong> {submittedExchange.shiprocket_pickup_courier_name}</p>
                        {submittedExchange.pickup_scheduled_at && (
                          <p><strong>Scheduled:</strong> {new Date(submittedExchange.pickup_scheduled_at).toLocaleDateString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {submittedExchange.shiprocket_delivery_awb_code && (
                    <div className="detail-item full-width">
                      <div className="delivery-info-box">
                        <h5>Delivery Details (New Product)</h5>
                        <p><strong>AWB Code:</strong> {submittedExchange.shiprocket_delivery_awb_code}</p>
                        <p><strong>Courier:</strong> {submittedExchange.shiprocket_delivery_courier_name}</p>
                        {submittedExchange.delivery_scheduled_at && (
                          <p><strong>Scheduled:</strong> {new Date(submittedExchange.delivery_scheduled_at).toLocaleDateString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {submittedExchange.images && submittedExchange.images.length > 0 && (
                    <div className="detail-item full-width">
                      <label>Uploaded Images:</label>
                      <div className="submitted-images-grid">
                        {submittedExchange.images.map((image, index) => (
                          <div key={index} className="submitted-image-item">
                            <img src={image} alt={`Exchange image ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="exchange-info-section">
                <h4>Exchange Process</h4>
                <div className="exchange-process-info">
                  <div className="process-step">
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <strong>Select Size/Color & Submit</strong>
                      <p>Choose new size or color for the same product</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <strong>Pay ₹100 Exchange Charge</strong>
                      <p>One-time fee for exchange processing</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <strong>Pickup Scheduled</strong>
                      <p>Courier picks up original product from your address</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-number">4</span>
                    <div className="step-content">
                      <strong>New Product Delivered</strong>
                      <p>Receive your new size/color</p>
                    </div>
                  </div>
                </div>
                <div className="important-note">
                  <strong>⚠️ Important:</strong> 
                  <ul>
                    <li>Exchange charge: ₹100 (non-refundable)</li>
                    <li>Only same product with different size/color allowed</li>
                    <li>Courier handles pickup - no need to ship yourself</li>
                    <li>Exchange within 7 days of delivery</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {selectedItem && productDetails && (
                  <div className="form-group">
                    <label>Product Details</label>
                    <div className="product-details-card">
                      {productDetails.main_image && (
                        <div className="product-image">
                          <img src={productDetails.main_image} alt={productDetails.name} />
                        </div>
                      )}
                      <div className="product-info">
                        <h4>{productDetails.name}</h4>
                        <div className="current-variant">
                          <p><strong>Current Size:</strong> {selectedItem.size || selectedItem.selectedSize || 'N/A'}</p>
                          {selectedItem.color && <p><strong>Current Color:</strong> {selectedItem.color}</p>}
                          <p><strong>Price:</strong> ₹{productDetails.total_price || productDetails.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="exchange-selection-row">
                  <div className="form-group">
                    <label htmlFor="exchangeSize">Exchange to Size *</label>
                    <select
                      id="exchangeSize"
                      value={exchangeSize}
                      onChange={(e) => setExchangeSize(e.target.value)}
                      required
                      disabled={loadingProduct || availableSizes.length === 0}
                    >
                      <option value="">Select Size</option>
                      {availableSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    {availableSizes.length === 0 && !loadingProduct && (
                      <small className="text-muted">No sizes available</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="exchangeColor">Exchange to Color (Optional)</label>
                    <select
                      id="exchangeColor"
                      value={exchangeColor}
                      onChange={(e) => setExchangeColor(e.target.value)}
                      disabled={loadingProduct || availableColors.length === 0}
                    >
                      <option value="">{selectedItem?.color ? 'Keep Same' : 'Select Color'}</option>
                      {availableColors.map(color => (
                        <option key={color.id} value={color.color}>{color.color}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Exchange *</label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe why you want to exchange (e.g., size too small, prefer different color)..."
                    required
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Upload Product Images (Optional)</label>
                  <div
                    className={`image-upload-section ${dragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-label">
                      <div className="upload-text">
                        {images.length > 0 ? `${images.length} image(s) selected` : 'Click to upload or drag & drop'}
                      </div>
                      <div className="upload-hint">Max 5 images allowed</div>
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="image-preview-section">
                      <h5>Image Previews ({imagePreviews.length}/5)</h5>
                      <div className="image-preview-grid">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                              title="Remove image"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="exchange-charge-notice">
                  <strong>💰 Exchange Charge: ₹100</strong>
                  <p>You'll be redirected to payment gateway after submitting</p>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleClose} className="cancel-button" disabled={loading || paymentProcessing}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button" disabled={loading || paymentProcessing || !reason.trim() || !exchangeSize}>
                    {loading || paymentProcessing ? (
                      <>
                        <span className="loading-spinner"></span>
                        {paymentProcessing ? 'Processing Payment...' : 'Submitting...'}
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeModal;
