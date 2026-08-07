import React, { useEffect, useState } from "react";
import API from "../../api";
import "./VideoShorts.css";

const FALLBACK_SHORTS = [
  {
    id: 1,
    title: "AUTUMN / WINTER 2026 CAMPAIGN",
    category: "HAUTE COUTURE",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-dress-41551-large.mp4"
  },
  {
    id: 2,
    title: "THE ART OF ELEGANCE",
    category: "RUNWAY SELECTION",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-41550-large.mp4"
  },
  {
    id: 3,
    title: "PRADA FINE ACCESSORIES",
    category: "LUXURY JEWELRY",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-gold-necklace-41552-large.mp4"
  }
];

const VideoShorts = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/short-video")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setShorts(res.data.data);
        } else {
          setShorts(FALLBACK_SHORTS);
        }
      })
      .catch(() => {
        setShorts(FALLBACK_SHORTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeShorts = shorts.length > 0 ? shorts : FALLBACK_SHORTS;

  return (
    <section className="video-shorts-section section-container">
      <div className="video-shorts-header">
        <span className="prada-eyebrow">EDITORIAL RUNWAY & LOOKS</span>
        <h2 className="section-heading">PRADA CAMPAIGN SHORTS</h2>
      </div>

      <div className="video-shorts-grid">
        {activeShorts.map((item, index) => (
          <div key={item.id || index} className="video-short-card">
            <div className="video-wrapper">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="video-player"
              >
                <source src={item.video_url || item.url} type="video/mp4" />
              </video>
              <div className="video-badge">{item.category || "PRADA EDITORIAL"}</div>
            </div>
            <div className="video-info-box">
              <p className="video-title">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideoShorts;
