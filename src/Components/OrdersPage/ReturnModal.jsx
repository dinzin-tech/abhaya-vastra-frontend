import React, { useState, useRef, useEffect } from 'react';
import API from '../../api';
import './ReturnModal.css';

const ReturnModal = ({ order, isOpen, onClose, onReturnSubmitted }) => {
  const [reason, setReason] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReturn, setSubmittedReturn] = useState(null);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && order) {
      setReason('');
      setImages([]);
      setImagePreviews([]);
      setError('');
      setIsSubmitted(false);
      setSubmittedReturn(null);
      setDragOver(false);

      // Fetch existing return request for this order
      fetchExistingReturn();
    }
  }, [isOpen, order?.id]);

  const fetchExistingReturn = async () => {
    if (!order?.id) return;

    setLoadingReturn(true);
    try {
      const response = await API.get(`/returns?order_id=${order.id}`);
      if (response.data.success && response.data.data.length > 0) {
        // Show existing return request
        setIsSubmitted(true);
        setSubmittedReturn(response.data.data[0]);
      } else {
        // No existing return request, show form
        setIsSubmitted(false);
        setSubmittedReturn(null);
      }
    } catch (err) {
      console.error('Error fetching existing return:', err);
      // If error, assume no existing return and show form
      setIsSubmitted(false);
      setSubmittedReturn(null);
    } finally {
      setLoadingReturn(false);
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

    // Create previews
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const returnData = {
        order_id: order.id,
        reason,
        images: imagePreviews
      };

      const response = await API.post('/returns', returnData);

      if (response.data.success) {
        setIsSubmitted(true);
        setSubmittedReturn(response.data.data);
        onReturnSubmitted();
      } else {
        setError(response.data.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error('Error submitting return request:', err);
      setError(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setImages([]);
    setImagePreviews([]);
    setError('');
    setIsSubmitted(false);
    setSubmittedReturn(null);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-contents" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isSubmitted ? 'Return Request Details' : 'Submit Return Request'}</h3>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loadingReturn ? (
            // Loading state while fetching existing return
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading return request details...</p>
            </div>
          ) : isSubmitted && submittedReturn ? (
            // Show return details after submission or existing return
            <div className="return-details-view">
              <div className="return-summary">
                <h4>Return Request Details</h4>
                <p>Your return request information and current status.</p>
              </div>

              <div className="return-info-card">
                <div className="return-info-header">
                  <h5>Return Request Information</h5>
                  <span className={`status-badge ${getStatusBadgeClass(submittedReturn.status)}`}>
                    {submittedReturn.status.charAt(0).toUpperCase() + submittedReturn.status.slice(1)}
                  </span>
                </div>

                <div className="return-details-grid">
                  <div className="detail-item">
                    <label>Reason:</label>
                    <p>{submittedReturn.reason}</p>
                  </div>

                  {submittedReturn.tracking_id && (
                    <div className="detail-item">
                      <label>Tracking ID:</label>
                      <p>{submittedReturn.tracking_id}</p>
                    </div>
                  )}

                  <div className="detail-item">
                    <label>Submitted On:</label>
                    <p>{new Date(submittedReturn.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>

                  <div className="detail-item">
                    <label>Order Number:</label>
                    <p>{order.order_number}</p>
                  </div>

                  {submittedReturn.admin_note && submittedReturn.status === 'rejected' && (
                    <div className="detail-item full-width">
                      <label>Reject Reason:</label>
                      <div className="admin-note-box">
                        <p>{submittedReturn.admin_note}</p>
                      </div>
                    </div>
                  )}

                  {submittedReturn.status === 'approved' && (
                    <div className="detail-item full-width">
                      <div className="pickup-info-box">
                        <h5>Pickup Details</h5>
                        {submittedReturn.shiprocket_return_awb_code ? (
                          <>
                            <p><strong>AWB Code:</strong> {submittedReturn.shiprocket_return_awb_code}</p>
                            <p><strong>Courier:</strong> {submittedReturn.shiprocket_return_courier_name}</p>
                            {submittedReturn.return_pickup_scheduled_at && (
                              <p><strong>Pickup Scheduled:</strong> {new Date(submittedReturn.return_pickup_scheduled_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}</p>
                            )}
                            <p className="pickup-note">📍 Courier will pick up from your delivery address</p>
                          </>
                        ) : (
                          <p>Pickup is being scheduled. You'll receive tracking details soon.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {submittedReturn.images && submittedReturn.images.length > 0 && (
                    <div className="detail-item full-width">
                      <label>Uploaded Images:</label>
                      <div className="submitted-images-grid">
                        {submittedReturn.images.map((image, index) => (
                          <div key={index} className="submitted-image-item">
                            <img src={image} alt={`Return image ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="return-status-note">
                  {submittedReturn.status === 'pending' && (
                    <p><strong>📧 Note:</strong> Your return request is under review. You'll be notified via email once it's processed.</p>
                  )}
                  {submittedReturn.status === 'approved' && (
                    <p><strong>✅ Approved:</strong> Pickup has been scheduled. Keep your product ready for courier pickup. Refund will be processed after we receive the item.</p>
                  )}
                  {submittedReturn.status === 'rejected' && (
                    <p><strong>❌ Rejected:</strong> Your return request has been rejected. Please check the reason above.</p>
                  )}
                  {submittedReturn.status === 'completed' && (
                    <p><strong>✨ Completed:</strong> Your return has been completed and refund has been processed!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Show return form for new requests
            <>
              <div className="return-info-section">
                <h4>Return Process</h4>
                <div className="return-process-info">
                  <div className="process-step">
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <strong>Submit Return Request</strong>
                      <p>Fill the form below with reason and product images</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <strong>Admin Reviews</strong>
                      <p>We'll review your request within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <strong>Pickup Scheduled</strong>
                      <p>Once approved, courier will pickup from your address</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-number">4</span>
                    <div className="step-content">
                      <strong>Refund Processed</strong>
                      <p>Product amount refunded after we receive the item</p>
                    </div>
                  </div>
                </div>
                <div className="important-note">
                  <strong>⚠️ Important:</strong> 
                  <ul>
                    <li>Courier will pick up from your delivery address</li>
                    <li>No need to ship yourself - we handle everything!</li>
                    <li>Shipping charges are non-refundable</li>
                    <li>Only product amount will be refunded</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="reason">Reason for Return *</label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe why you want to return this item(s). Be specific about the issue..."
                    required
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Upload Product Images</label>
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
                      {/* <div className="upload-icon">Camera Icon</div> */}
                      <div className="upload-text">
                        {images.length > 0 ? `${images.length} image(s) selected` : 'Click to upload or drag & drop'}
                      </div>
                      <div className="upload-hint">
                        Upload clear photos of the item(s) you want to return. Max 5 images allowed.
                      </div>
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
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>


                {error && <div className="error-message">{error}</div>}

                <div className="modal-actions">
                  <button type="button" onClick={handleClose} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="submit-button" disabled={loading || !reason.trim()}>
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Return Request'
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

export default ReturnModal;
