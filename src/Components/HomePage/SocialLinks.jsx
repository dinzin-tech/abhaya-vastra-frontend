import React, { useEffect, useState } from "react";
import API from "../../api"; // Make sure the path is correct

const SocialLinks = ({ className = "" }) => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const res = await API.get("/social-links");
        setSocialLinks(res.data);
      } catch (err) {
        console.error("Error fetching social links:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  return (
    <div className={`social-icons ${className}`}>
      {loading ? (
        <p className="no-social">Loading...</p>
      ) : socialLinks.length > 0 ? (
        socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.title}
            title={link.title}
          >
            <i className={`fab ${link.icon}`}></i>
          </a>
        ))
      ) : (
        <p className="no-social">No social links available</p>
      )}
    </div>
  );
};

export default SocialLinks;
