import React from "react";
import "./TrackingModal.css";

const TrackingModal = ({ isOpen, onClose, trackingData, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <h2>Track Your Order</h2>
          <button className="tracking-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tracking-modal-body">
          {loading && (
            <div className="tracking-loading">
              <p>Fetching tracking information...</p>
            </div>
          )}

          {error && (
            <div className="tracking-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && trackingData && (
            <div className="tracking-details">
              {/* Shipment Info */}
              {trackingData.tracking_data && (
                <div className="tracking-section">
                  <h3>Shipment Information</h3>
                  <div className="tracking-info-grid">
                    <div className="tracking-info-item">
                      <span className="tracking-label">AWB Code:</span>
                      <span className="tracking-value">{trackingData.tracking_data.awb_code || "N/A"}</span>
                    </div>
                    <div className="tracking-info-item">
                      <span className="tracking-label">Courier:</span>
                      <span className="tracking-value">{trackingData.tracking_data.courier_name || "N/A"}</span>
                    </div>
                    <div className="tracking-info-item">
                      <span className="tracking-label">Current Status:</span>
                      <span className="tracking-value tracking-status">
                        {trackingData.tracking_data.shipment_status || "Processing"}
                      </span>
                    </div>
                    <div className="tracking-info-item">
                      <span className="tracking-label">Expected Delivery:</span>
                      <span className="tracking-value">
                        {trackingData.tracking_data.edd || "Calculating..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking History */}
              {trackingData.tracking_data?.shipment_track && trackingData.tracking_data.shipment_track.length > 0 && (
                <div className="tracking-section">
                  <h3>Tracking History</h3>
                  <div className="tracking-timeline">
                    {trackingData.tracking_data.shipment_track.map((track, index) => (
                      <div key={index} className="tracking-timeline-item">
                        <div className="tracking-timeline-dot"></div>
                        <div className="tracking-timeline-content">
                          <p className="tracking-timeline-status">{track.current_status}</p>
                          <p className="tracking-timeline-date">
                            {track.date} - {track.time || ""}
                          </p>
                          {track.location && (
                            <p className="tracking-timeline-location">
                              📍 {track.location}
                            </p>
                          )}
                          {track.activities && (
                            <p className="tracking-timeline-activity">{track.activities}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No tracking data available */}
              {!trackingData.tracking_data && (
                <div className="tracking-no-data">
                  <p>No tracking information available yet.</p>
                  <p>Your order is being processed. Tracking will be available once the shipment is picked up.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="tracking-modal-footer">
          <button className="tracking-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
