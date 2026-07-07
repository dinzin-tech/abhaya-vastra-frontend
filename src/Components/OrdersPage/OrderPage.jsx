import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import { allProducts } from "../products";
import ReturnModal from "./ReturnModal";
import ExchangeModal from "./ExchangeModal";
import TrackingModal from "./TrackingModal";
import ReviewModal from "./ReviewModal";
import "./OrderPage.css";

// ─── Status helpers ───────────────────────────────────────────────
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_LABELS = {
  pending: "Placed",
  processing: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

const STATUS_ICONS = {
  pending: "🛒",
  processing: "✅",
  shipped: "🚚",
  delivered: "📦",
  cancelled: "❌",
  failed: "⚠️",
};

const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

// ─── Skeleton loader ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="order-card skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-line w-40" />
      <div className="skeleton-badge" />
    </div>
    <div className="skeleton-stepper">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-step">
          <div className="skeleton-dot" />
          <div className="skeleton-line w-20" style={{ marginTop: 6 }} />
        </div>
      ))}
    </div>
    <div className="skeleton-items">
      {[0, 1].map((i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-img" />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-40" style={{ marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Status Stepper ───────────────────────────────────────────────
const StatusStepper = ({ status }) => {
  const isCancelled = status === "cancelled" || status === "failed";
  const currentIndex = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="stepper-cancelled">
        <span className="cancelled-icon">❌</span>
        <span>Order {status === "cancelled" ? "Cancelled" : "Failed"}</span>
      </div>
    );
  }

  return (
    <div className="order-stepper">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className={`stepper-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
              <div className="stepper-dot">
                {done ? (active ? <span className="dot-pulse" /> : "✓") : ""}
              </div>
              <span className="stepper-label">{STATUS_LABELS[step]}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`stepper-line ${i < currentIndex ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Filter Tabs ──────────────────────────────────────────────────
const FILTERS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

// ─── Main Component ───────────────────────────────────────────────
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState(null);

  const [returns, setReturns] = useState([]);
  const [exchanges, setExchanges] = useState([]);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchReturns();
    fetchExchanges();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await API.get("/returns");
      if (res.data.success) setReturns(res.data.data);
    } catch (err) {
      console.error("Error fetching returns:", err);
    }
  };

  const fetchExchanges = async () => {
    try {
      const res = await API.get("/exchanges");
      if (res.data.success) setExchanges(res.data.data);
    } catch (err) {
      console.error("Error fetching exchanges:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/orders");
      if (res.data.success) {
        setOrders(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch orders");
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
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canBeReturned = (order) => {
    if (order.status !== "delivered") return false;
    const ref = order.delivered_at
      ? new Date(order.delivered_at)
      : new Date(order.created_at);
    if (isNaN(ref.getTime())) return false;
    return Math.floor((Date.now() - ref) / 86400000) <= 7;
  };

  const canBeExchanged = (order) => {
    if (order.status !== "delivered") return false;
    if (getReturnStatusForOrder(order.id)) return false;
    const ref = order.delivered_at
      ? new Date(order.delivered_at)
      : new Date(order.created_at);
    if (isNaN(ref.getTime())) return false;
    return Math.floor((Date.now() - ref) / 86400000) <= 7;
  };

  const getReturnStatusForOrder = (id) =>
    returns.find((r) => r.order_id === id);
  const getExchangeStatusForOrder = (id) =>
    exchanges.find((ex) => ex.order_id === id);

  const handleReturnClick = (order) => {
    setSelectedOrderForReturn(order);
    setShowReturnModal(true);
  };
  const handleReturnSubmitted = () => { fetchOrders(); fetchReturns(); };

  const handleExchangeClick = (order) => {
    setSelectedOrderForExchange(order);
    setShowExchangeModal(true);
  };
  const handleExchangeSubmitted = () => { fetchOrders(); fetchExchanges(); };

  const handleTrackOrder = async (order) => {
    try {
      setTrackingLoading(true);
      setTrackingError(null);
      setTrackingOrder(order);
      setShowTrackingModal(true);
      const res = await API.get(`/shiprocket/track/${order.id}`);
      if (res.data.success) {
        setTrackingData(res.data.data);
      } else {
        setTrackingError(res.data.message || "Unable to fetch tracking information");
      }
    } catch (err) {
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
    setTrackingOrder(null);
  };

  const handleWriteReviewClick = (productId, productName, productImage) => {
    setSelectedProductForReview({ id: productId, name: productName, image: productImage });
    setShowReviewModal(true);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // ── Derived ──────────────────────────────────────────────────────
  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const totalSpent = orders
    .filter((o) => o.payment_status === "completed")
    .reduce((acc, o) => acc + parseFloat(o.total || 0), 0);

  const activeOrdersCount = orders.filter(
    (o) => !["delivered", "cancelled", "failed"].includes(o.status)
  ).length;

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="orders-wrapper">
        <div className="orders-page-header">
          <h1 className="orders-title">My Orders</h1>
        </div>
        <div className="orders-list">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="orders-wrapper">
        <div className="orders-page-header">
          <h1 className="orders-title">My Orders</h1>
        </div>
        <div className="orders-error-state">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
          {error.includes("login") && (
            <Link to="/login" className="error-cta-btn">
              Login to View Orders
            </Link>
          )}
          {!error.includes("login") && (
            <button className="error-cta-btn" onClick={fetchOrders}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="orders-wrapper">
        <div className="orders-page-header">
          <h1 className="orders-title">My Orders</h1>
        </div>
        <div className="orders-empty-state">
          <div className="empty-illustration">
            <div className="empty-bag-icon">🛍️</div>
          </div>
          <h3 className="empty-title">No Orders Yet</h3>
          <p className="empty-subtitle">
            Looks like you haven't placed any orders. Start shopping and your orders will appear here!
          </p>
          <Link to="/all-products" className="empty-cta-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Render ──────────────────────────────────────────────────
  return (
    <div className="orders-wrapper">
      {/* ── Page Header ── */}
      <div className="orders-page-header">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-subtitle">Track, manage, and review your purchases</p>
      </div>

      {/* ── Stats Bar ── */}
      <div className="orders-stats-bar">
        <div className="stat-item">
          <span className="stat-value">{orders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value stat-active">{activeOrdersCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value stat-spent">₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          <span className="stat-label">Total Spent</span>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="orders-filter-bar">
        {FILTERS.map((f) => {
          const count =
            f === "all"
              ? orders.length
              : orders.filter((o) => o.status === f).length;
          if (f !== "all" && count === 0) return null;
          return (
            <button
              key={f}
              className={`filter-pill ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === "all" ? "All" : STATUS_LABELS[f] || f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Empty filtered state ── */}
      {filteredOrders.length === 0 && (
        <div className="orders-empty-filtered">
          <p>No {activeFilter} orders found.</p>
          <button className="filter-reset-btn" onClick={() => setActiveFilter("all")}>
            Show All Orders
          </button>
        </div>
      )}

      {/* ── Orders List ── */}
      <div className="orders-list">
        {filteredOrders.map((order) => {
          const returnStatus = getReturnStatusForOrder(order.id);
          const exchangeStatus = getExchangeStatusForOrder(order.id);
          const showReturn = canBeReturned(order) && !exchangeStatus;
          const showExchange = canBeExchanged(order) || exchangeStatus;
          const showTrack = !!order.shiprocket_awb_code;
          const items = order.items || [];
          const isExpanded = expandedOrders[order.id];
          const visibleItems = isExpanded ? items : items.slice(0, 2);
          const hasMore = items.length > 2;
          const isCancelled = order.status === "cancelled" || order.status === "failed";

          return (
            <div
              key={order.id}
              className={`order-card ${isCancelled ? "order-card--cancelled" : ""}`}
            >
              {/* ── Card Header ── */}
              <div className="order-card-header">
                <div className="order-meta">
                  <div className="order-number-row">
                    <span className="order-id-label">Order</span>
                    <span className="order-id-value">#{order.order_number}</span>
                  </div>
                  <span className="order-date-text">
                    📅 {formatDate(order.created_at)}
                  </span>
                  {order.shiprocket_awb_code && (
                    <span className="order-awb-text" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                      🚚 AWB: <strong>{order.shiprocket_awb_code}</strong> ({order.shiprocket_courier_name})
                    </span>
                  )}
                </div>
                <div className="order-badges">
                  <span className={`order-status-chip status-${order.status}`}>
                    {STATUS_ICONS[order.status]} {" "}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`payment-chip payment-${order.payment_status}`}>
                    {order.payment_status === "completed" ? "✓ Paid" : order.payment_status === "failed" ? "✗ Failed" : "⏳ Pending"}
                  </span>
                </div>
              </div>

              {/* ── Status Stepper ── */}
              <StatusStepper status={order.status} />

              {/* ── Order Items ── */}
              <div className="order-items-section">
                {visibleItems.map((item, index) => {
                  const productId = item.id || item.product_id;
                  const product = allProducts.find((p) => p.id === productId);
                  const itemImage =
                    item.image || product?.image || "https://via.placeholder.com/70";
                  const itemName = item.name || product?.name || "Product";

                  return (
                    <div key={index} className="order-item-row">
                      <div className="item-img-wrap">
                        <img src={itemImage} alt={itemName} className="order-item-img" />
                        <span className="item-qty-badge">×{item.quantity || 1}</span>
                      </div>
                      <div className="order-item-info">
                        <p className="order-item-name">{itemName}</p>
                        <div className="order-item-meta">
                          {(item.size || item.selectedSize) && (
                            <span className="item-meta-chip">
                              Size: {item.size || item.selectedSize}
                            </span>
                          )}
                          {item.color && (
                            <span className="item-meta-chip">
                              Color: {item.color}
                            </span>
                          )}
                          {order.status === "delivered" && (
                            <button
                              className="item-meta-chip write-review-chip-btn"
                              onClick={() => handleWriteReviewClick(productId, itemName, itemImage)}
                            >
                              ⭐ Write Review
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="order-item-price">
                        ₹{parseFloat(item.price).toFixed(0)}
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <button
                    className="expand-items-btn"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    {isExpanded
                      ? "▲ Show less"
                      : `▼ Show ${items.length - 2} more item${items.length - 2 > 1 ? "s" : ""}`}
                  </button>
                )}
              </div>

              {/* ── Order Summary ── */}
              <div className="order-summary-row">
                {order.discount > 0 && (
                  <>
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="summary-line discount-line">
                      <span>
                        Discount {order.coupon_code ? `(${order.coupon_code})` : ""}
                      </span>
                      <span>−₹{parseFloat(order.discount).toFixed(2)}</span>
                    </div>
                  </>
                )}
                {order.shipping_charge > 0 && (
                  <div className="summary-line">
                    <span>Shipping</span>
                    <span>₹{parseFloat(order.shipping_charge).toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-total-line">
                  <span>Total Paid</span>
                  <span className="total-amount-value">
                    ₹{parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ── Delivery Address (compact) ── */}
              {order.address && (
                <div className="order-delivery-info">
                  <span className="delivery-icon">📍</span>
                  <span className="delivery-address">
                    {order.name} · {order.address}, {order.city}
                    {order.zip ? ` - ${order.zip}` : ""}
                  </span>
                </div>
              )}

              {/* ── Return/Exchange status banners ── */}
              {returnStatus && (
                <div className={`request-status-banner banner-${returnStatus.status}`}>
                  <span>↩ Return Request:</span>
                  <span className="banner-status">
                    {returnStatus.status.charAt(0).toUpperCase() + returnStatus.status.slice(1)}
                  </span>
                </div>
              )}
              {exchangeStatus && (
                <div className={`request-status-banner banner-${exchangeStatus.status}`}>
                  <span>🔄 Exchange Request:</span>
                  <span className="banner-status">
                    {exchangeStatus.status.charAt(0).toUpperCase() + exchangeStatus.status.slice(1)}
                  </span>
                </div>
              )}

              {/* ── Actions ── */}
              {(showTrack || showExchange || showReturn) && (
                <div className="order-actions-row">
                  {showTrack && (
                    <button
                      className="action-btn action-btn--track"
                      onClick={() => handleTrackOrder(order)}
                    >
                      <span>🚚</span> Track Order
                    </button>
                  )}
                  {showExchange && (
                    <button
                      className="action-btn action-btn--exchange"
                      onClick={() => handleExchangeClick(order)}
                    >
                      <span>🔄</span>{" "}
                      {exchangeStatus ? "Exchange Details" : "Exchange"}
                    </button>
                  )}
                  {showReturn && (
                    <button
                      className="action-btn action-btn--return"
                      onClick={() => handleReturnClick(order)}
                    >
                      <span>↩</span>{" "}
                      {returnStatus ? "Return Details" : "Return Order"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modals ── */}
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
        order={trackingOrder}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedProductForReview(null);
        }}
        productId={selectedProductForReview?.id}
        productName={selectedProductForReview?.name}
        productImage={selectedProductForReview?.image}
      />
    </div>
  );
};

export default OrdersPage;
