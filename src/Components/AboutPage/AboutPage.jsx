import React, { useState, useEffect } from "react";
import API from "../../api"; // your axios instance
import "./AboutPage.css";

const AboutPage = () => {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    API.get("/about-us")
      .then((res) => setAbout(res.data))
      .catch((err) => console.error("Error fetching About Us:", err));
  }, []);

  if (!about) {
    return (
      <div className="about-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="about-container">
      <div className="about-content-card">
        <h1 className="page-title">{about.title}</h1>
        <p
          className="page-text"
          dangerouslySetInnerHTML={{ __html: about.description }}
        ></p>
      </div>
    </div>
  );
};

export default AboutPage;