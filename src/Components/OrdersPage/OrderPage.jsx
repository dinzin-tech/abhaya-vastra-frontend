import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import { allProducts } from "../products";
import ReturnModal from "./ReturnModal";
import ExchangeModal from "./ExchangeModal";
import TrackingModal from "./TrackingModal";
import "./OrderPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState(null);

  const [returns, setReturns] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  
  // Tracking state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchReturns();
    fetchExchanges();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await API.get("/returns");
      if (response.data.success) {
        setReturns(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching returns:", err);
    }
  };

  const fetchExchanges = async () => {
    try {
      const response = await API.get("/exchanges");
      if (response.data.success) {
        setExchanges(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching exchanges:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/orders");
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        setError("Please login to view your orders");
      } else {
        setError(err.response?.data?.message || "Failed to fetch orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const canBeReturned = (order) => {
    if (order.status !== 'delivered') {
      return false;
    }

    if (!order.delivered_at) {
      // For existing orders without delivered_at, use created_at as fallback
      const createdDate = new Date(order.created_at);
      const now = new Date();
      const daysSinceCreated = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      return daysSinceCreated <= 7;
    }

    const deliveredDate = new Date(order.delivered_at);
    const now = new Date();

    if (isNaN(deliveredDate.getTime())) {
      return false;
    }

    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 7;
  };

  const handleReturnClick = (order) => {
    setSelectedOrderForReturn(order);
    setShowReturnModal(true);
  };

  const handleReturnSubmitted = () => {
    // Refresh orders and returns after return submission
    fetchOrders();
    fetchReturns();
  };

  const handleExchangeClick = (order) => {
    setSelectedOrderForExchange(order);
    setShowExchangeModal(true);
  };

  const handleExchangeSubmitted = () => {
    // Refresh orders and exchanges after exchange submission
    fetchOrders();
    fetchExchanges();
  };

  const getReturnStatusForOrder = (orderId) => {
    return returns.find(returnRequest => returnRequest.order_id === orderId);
  };

  const getExchangeStatusForOrder = (orderId) => {
    return exchanges.find(exchangeRequest => exchangeRequest.order_id === orderId);
  };

  const canBeExchanged = (order) => {
    if (order.status !== 'delivered') {
      return false;
    }

    // Check if there's already a return request (don't allow exchange if return exists)
    if (getReturnStatusForOrder(order.id)) {
      return false;
    }

    const now = new Date();
    let referenceDate;

    // Use delivered_at if available, otherwise use created_at as fallback
    if (order.delivered_at) {
      const deliveredDate = new Date(order.delivered_at);
      if (!isNaN(deliveredDate.getTime())) {
        referenceDate = deliveredDate;
      }
    }
    
    // If delivered_at is not available or invalid, use created_at
    if (!referenceDate) {
      referenceDate = new Date(order.created_at);
    }

    const daysSinceReference = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24));
    return daysSinceReference <= 7;
  };

  const handleTrackOrder = async (order) => {
    try {
      setTrackingLoading(true);
      setTrackingError(null);
      setShowTrackingModal(true);
      
      const response = await API.get(`/shiprocket/track/${order.id}`);
      
      if (response.data.success) {
        setTrackingData(response.data.data);
      } else {
        setTrackingError(response.data.message || "Unable to fetch tracking information");
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      setTrackingError(
        err.response?.data?.message || 
        "Unable to fetch tracking information. Please try again later."
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCloseTrackingModal = () => {
    setShowTrackingModal(false);
    setTrackingData(null);
    setTrackingError(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'completed': 'status-completed'
    };
    return statusClasses[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="orders-wrapper">
        <h2 className="orders-title">Your Orders</h2>
        <p className="loading-message">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-wrapper">
        <h2 className="orders-title">Your Orders</h2>
        <div className="error-message">
          <p>{error}</p>
          {error.includes('login') && (
            <Link to="/login" className="login-link">Go to Login</Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="orders-wrapper">
      <h2 className="orders-title">Your Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        orders.map((order) => {
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <p className="order-id">Order ID: {order.order_number}</p>
                  <p className="order-date">Date: {formatDate(order.created_at)}</p>
                </div>
                <div className="order-status-badges">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`payment-badge payment-${order.payment_status}`}>
                    Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items && order.items.map((item, index) => {
                  // Fallback: Get product from local products array if image is missing
                  const productId = item.id || item.product_id;
                  const product = allProducts.find(p => p.id === productId);
                  const itemImage = item.image || product?.image || 'https://via.placeholder.com/70';
                  const itemName = item.name || product?.name || 'Product';
                  
                  return (
                    <div key={index} className="order-item">
                      {/* <Link to={`/product/${productId}`}> */}
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="item-image"
                        />
                      {/* </Link> */}
                      <div className="item-info">
                        {/* <Link to={`/product/${productId}`} className="item-name"> */}
                          {itemName}
                        {/* </Link> */}
                        <div className="item-details">
                          <p className="item-detail">Size: {item.size || item.selectedSize || 'N/A'}</p>
                          <p className="item-detail">Quantity: {item.quantity || 1}</p>
                        </div>
                        <div className="item-badges">
                          <span className="badge price-badge">₹{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-summary">
                {order.discount > 0 && (
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}:</span>
                    <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">₹{parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="order-actions">
                {/* Track Order Button - Show if shipment has AWB code */}
                {order.shiprocket_awb_code && (
                  <button
                    className="track-button"
                    onClick={() => handleTrackOrder(order)}
                  >
                    📦 Track Order
                  </button>
                )}
                
                {/* Exchange Order Button - Show if exchange is possible or if there's an existing exchange */}
                {(canBeExchanged(order) || getExchangeStatusForOrder(order.id)) && (
                  <button
                    className="exchange-button"
                    onClick={() => handleExchangeClick(order)}
                  >
                    {getExchangeStatusForOrder(order.id) ? 'Exchange Details' : 'Exchange'}
                  </button>
                )}
                
                {/* Return Order Button */}
                {canBeReturned(order) && !getExchangeStatusForOrder(order.id) && (
                  <button
                    className="return-button"
                    onClick={() => handleReturnClick(order)}
                  >
                    Return Order
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      <ReturnModal
        order={selectedOrderForReturn}
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onReturnSubmitted={handleReturnSubmitted}
      />

      <ExchangeModal
        order={selectedOrderForExchange}
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        onExchangeSubmitted={handleExchangeSubmitted}
      />

      <TrackingModal
        isOpen={showTrackingModal}
        onClose={handleCloseTrackingModal}
        trackingData={trackingData}
        loading={trackingLoading}
        error={trackingError}
      />
    </div>
  );
};

export default OrdersPage;
