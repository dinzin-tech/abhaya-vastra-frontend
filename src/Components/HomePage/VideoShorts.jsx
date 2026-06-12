import React, { useEffect, useState } from "react";
import API from "../../api";
import "./VideoShorts.css";

const VideoShorts = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/short-video")
      .then((res) => {
        if (res.data.success) {
          setShorts(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching short videos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="video-shorts-section section-container">
        <h2 className="section-heading">Video Shorts</h2>
        <p>Loading videos...</p>
      </section>
    );
  }

  return (
    <section className="video-shorts-section section-container">
      <h2 className="section-heading">Video Shorts</h2>
      <div className="video-shorts-grid">
        {shorts.length > 0 ? (
          shorts.map((item, index) => (
            <div key={index} className="video-short-card">
              {item.video_url ? (
                <video
                  width="100%"
                  height="400"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls={false}
                  className="video-player"
                >
                  <source src={item.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p>Video not found</p>
              )}
              <div className="product-info">
                <p className="product-title">{item.title}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No videos found.</p>
        )}
      </div>
    </section>
  );
};

export default VideoShorts;
