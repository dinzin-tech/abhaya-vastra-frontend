import React, { useState, useEffect } from "react";
import API from "../../api"; // your axios instance
import "./TermsPage.css";

const TermsPage = () => {
  const [terms, setTerms] = useState(null);

  useEffect(() => {
    API.get("/terms")
      .then((res) => setTerms(res.data))
      .catch((err) => console.error("Error fetching Terms & Conditions:", err));
  }, []);

  if (!terms) {
    return (
      <div className="terms-content-card">
        <p className="page-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="terms-content-card">
      <h1 className="page-title">{terms.title}</h1>
      <div
        className="page-text"
        dangerouslySetInnerHTML={{ __html: terms.description }}
      ></div>
    </div>
  );
};

export default TermsPage;