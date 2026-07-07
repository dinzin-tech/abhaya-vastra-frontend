import React from "react";
import "./TrackingModal.css";

const TrackingModal = ({ isOpen, onClose, trackingData, loading, error, order }) => {
  if (!isOpen) return null;

  const td = trackingData?.tracking_data;

  return (
    <div className="tmodal-overlay" onClick={onClose}>
      <div className="tmodal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tmodal-header">
          <div className="tmodal-header-left">
            <div className="tmodal-icon">🚚</div>
            <div>
              <h2 className="tmodal-title">Track Order</h2>
              {order?.order_number && (
                <p className="tmodal-subtitle">#{order.order_number}</p>
              )}
            </div>
          </div>
          <button className="tmodal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="tmodal-body">
          {/* Loading */}
          {loading && (
            <div className="tmodal-loading">
              <div className="tmodal-spinner" />
              <p>Fetching live tracking info...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="tmodal-error">
              <div className="tmodal-error-icon">⚠️</div>
              <p className="tmodal-error-text">{error}</p>
              <p className="tmodal-error-hint">
                Tracking info will be available once your order is shipped.
              </p>
            </div>
          )}

          {/* No data */}
          {!loading && !error && !td && (
            <div className="tmodal-nodata">
              <div className="tmodal-nodata-icon">📦</div>
              <p className="tmodal-nodata-title">No Tracking Info Yet</p>
              <p className="tmodal-nodata-hint">
                Your order is being packed. Tracking will be available once
                your shipment is picked up by the courier.
              </p>
            </div>
          )}

          {/* Tracking data */}
          {!loading && !error && td && (
            <div className="tmodal-details">
              {/* Shipment info cards */}
              <div className="tmodal-info-grid">
                {td.awb_code && (
                  <div className="tmodal-info-card">
                    <span className="tinfo-label">AWB Code</span>
                    <span className="tinfo-value mono">{td.awb_code}</span>
                  </div>
                )}
                {td.courier_name && (
                  <div className="tmodal-info-card">
                    <span className="tinfo-label">Courier</span>
                    <span className="tinfo-value">{td.courier_name}</span>
                  </div>
                )}
                {td.shipment_status && (
                  <div className="tmodal-info-card tinfo-status-card">
                    <span className="tinfo-label">Current Status</span>
                    <span className="tinfo-status-value">{td.shipment_status}</span>
                  </div>
                )}
                {td.edd && (
                  <div className="tmodal-info-card">
                    <span className="tinfo-label">Expected Delivery</span>
                    <span className="tinfo-value">{td.edd}</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {td.shipment_track && td.shipment_track.length > 0 && (
                <div className="tmodal-timeline-section">
                  <h3 className="tmodal-section-title">Tracking History</h3>
                  <div className="tmodal-timeline">
                    {td.shipment_track.map((track, index) => (
                      <div
                        key={index}
                        className={`tmodal-timeline-item ${index === 0 ? "latest" : ""}`}
                      >
                        <div className="timeline-left">
                          <div className="timeline-dot">
                            {index === 0 && <span className="timeline-pulse" />}
                          </div>
                          {index < td.shipment_track.length - 1 && (
                            <div className="timeline-connector" />
                          )}
                        </div>
                        <div className="timeline-content">
                          <p className="timeline-status">{track.current_status}</p>
                          <p className="timeline-date">
                            {track.date}
                            {track.time ? ` · ${track.time}` : ""}
                          </p>
                          {track.location && (
                            <p className="timeline-location">
                              📍 {track.location}
                            </p>
                          )}
                          {track.activities && (
                            <p className="timeline-activity">{track.activities}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tmodal-footer">
          <button className="tmodal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
