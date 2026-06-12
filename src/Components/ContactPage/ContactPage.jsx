import React, { useState, useEffect } from "react";
import "./ContactPage.css";
import API from "../../api";

const ContactPage = ({ onNavigateToHome }) => {
  const [showModal, setShowModal] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "support@ecommerce.com",
    phone: "+1 (234) 567-890",
    address: "123 E-Commerce Ave, Suite 101, Business City, 90210",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch contact details from API
  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await API.get("/contact-details");
        if (response.data.success && response.data.data) {
          setContactInfo({
            email: response.data.data.email || contactInfo.email,
            phone: response.data.data.phone || contactInfo.phone,
            address: response.data.data.address || contactInfo.address,
          });
        }
      } catch (err) {
        console.error("Error fetching contact details:", err);
        setError("Failed to load contact information. Using default details.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, []);

  // ✅ Handle form submit and send message to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await API.post("/contact", data);
      if (response.data.success) {
        setShowModal(true);
        e.target.reset();
      } else {
        alert(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-grid">
        {/* ✅ Left Info Section */}
        <div className="contact-card info-card">
          <h2 className="contact-title">Get in Touch</h2>
          <div className="info-list">
            {loading ? (
              <div className="loading-indicator">Loading contact information...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="info-item">
                  <i className="fa-solid fa-envelope icon"></i>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href={`mailto:${contactInfo.email}`} className="info-link">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fa-solid fa-phone icon"></i>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href={`tel:${contactInfo.phone.replace(/\D/g, "")}`} className="info-link">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fa-solid fa-location-dot icon"></i>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="info-text">{contactInfo.address}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ Right Form Section */}
        <div className="contact-card form-card">
          <h2 className="contact-title">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <textarea name="message" placeholder="Your Message" required></textarea>
            <button type="submit" className="contact-button">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Message Sent!</h3>
            <p>Thank you for your message. We will get back to you soon.</p>
            <button onClick={() => setShowModal(false)} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
