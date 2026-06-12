import React, { useState, useEffect } from "react";
import API from "../../api"; // your axios instance
import "./PrivacyPage.css";

const PrivacyPage = () => {
  const [privacy, setPrivacy] = useState(null);

  useEffect(() => {
    API.get("/privacy")
      .then((res) => setPrivacy(res.data))
      .catch((err) => console.error("Error fetching Privacy Policy:", err));
  }, []);

  if (!privacy) {
    return (
      <div className="privacy-content-card">
        <p className="page-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="privacy-content-card">
      <h1 className="page-title">{privacy.title}</h1>
      <div
        className="page-text"
        dangerouslySetInnerHTML={{ __html: privacy.description }}
      ></div>
    </div>
  );
};

export default PrivacyPage;