import React, { useState, useEffect } from "react";
import API from "../../api"; 
import "./FaqPage.css";

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  // Fetch FAQs from backend
  useEffect(() => {
    API.get("/faq")
      .then((res) => setFaqs(res.data))
      .catch((err) => console.error("Error fetching FAQs:", err));
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1 className="faq-title">Frequently Asked Questions</h1>

      {faqs.length === 0 ? (
        <p className="faq-loading">Loading FAQs...</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="faq-item">
              <button
                className="faq-button"
                onClick={() => toggleFAQ(index)}
              >
                <span className="faq-question">{faq.question}</span>
                <svg
                  className={`faq-icon ${openIndex === index ? "open" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                className={`faq-answer-container ${
                  openIndex === index ? "open" : "closed"
                }`}
              >
                <div className="faq-answer-content">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqPage;