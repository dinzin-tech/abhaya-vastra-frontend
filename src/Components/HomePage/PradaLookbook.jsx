import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import "./PradaLookbook.css";

/* ─── Fallback data – shown when the API returns nothing ─────────────────── */
const FALLBACK_LOOKBOOKS = [
  {
    id: "fb-1",
    title: "ABHAYA VASTRA COUTURE",
    subtitle: "EDITORIAL RUNWAY COLLECTION",
    image_url:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    link: "/all-products",
    size: "large",
  },
  {
    id: "fb-2",
    title: "WOMEN'S READY TO WEAR",
    subtitle: "TIMELESS ELEGANCE",
    image_url:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    link: "/all-products",
    size: "medium",
  },
  {
    id: "fb-3",
    title: "BESPOKE TAILORING",
    subtitle: "CUSTOM MADE LUXURY",
    image_url:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    link: "/customization",
    size: "medium",
  },
  {
    id: "fb-4",
    title: "FINE ACCESSORIES",
    subtitle: "GALLERIA LEATHERWEAR",
    image_url:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
    link: "/featured-products",
    size: "full",
  },
];

const PradaLookbook = () => {
  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/lookbooks")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setLookbooks(res.data);
        } else {
          setLookbooks(FALLBACK_LOOKBOOKS);
        }
      })
      .catch(() => {
        setLookbooks(FALLBACK_LOOKBOOKS);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeItems = lookbooks.length > 0 ? lookbooks : FALLBACK_LOOKBOOKS;

  if (loading) {
    return (
      <section className="prada-lookbook-section">
        <div className="lookbook-header">
          <h2 className="prada-section-title font-prada-heading">
            EDITORIAL COLLECTIONS
          </h2>
          <p className="prada-section-subtitle">
            DISCOVER THE LATEST CAMPAIGN &amp; HAUTE COUTURE LOOKS
          </p>
        </div>
        <div className="lookbook-grid lookbook-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lookbook-card-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="prada-lookbook-section">
      <div className="lookbook-header">
        <h2 className="prada-section-title font-prada-heading">
          EDITORIAL COLLECTIONS
        </h2>
        <p className="prada-section-subtitle">
          DISCOVER THE LATEST CAMPAIGN &amp; HAUTE COUTURE LOOKS
        </p>
      </div>

      <div className="lookbook-grid">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className={`lookbook-card lookbook-${item.size || "medium"}`}
          >
            <Link to={item.link || "/all-products"} className="lookbook-link">
              <img
                src={item.image_url || item.image}
                alt={item.title}
                className="lookbook-img"
                loading="lazy"
              />
              <div className="lookbook-overlay">
                <div className="lookbook-content">
                  {item.subtitle && (
                    <span className="lookbook-subtitle">{item.subtitle}</span>
                  )}
                  <h3 className="lookbook-title font-prada-heading">
                    {item.title}
                  </h3>
                  <button className="prada-btn-white lookbook-btn">
                    EXPLORE NOW
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PradaLookbook;
