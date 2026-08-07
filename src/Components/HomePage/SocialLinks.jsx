import React, { useEffect, useState } from "react";
import API from "../../api";

const DEFAULT_SOCIAL_LINKS = [
  {
    id: "default-insta",
    title: "Instagram",
    icon: "fa-instagram",
    url: "https://www.instagram.com/abhaya_vastra",
    isSvg: "instagram"
  },
  {
    id: "default-fb",
    title: "Facebook",
    icon: "fa-facebook-f",
    url: "https://www.facebook.com/abhayavastra",
    isSvg: "facebook"
  },
];

const SocialLinks = ({ className = "" }) => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const res = await API.get("/social-links");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSocialLinks(res.data);
        } else {
          setSocialLinks(DEFAULT_SOCIAL_LINKS);
        }
      } catch (err) {
        setSocialLinks(DEFAULT_SOCIAL_LINKS);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  const linksToRender = socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIAL_LINKS;

  return (
    <div className={`social-icons ${className}`}>
      {linksToRender.map((link) => {
        const titleLower = (link.title || "").toLowerCase();
        const isInsta = titleLower.includes("insta") || link.icon?.includes("instagram") || link.isSvg === "instagram";
        const isFb = titleLower.includes("face") || link.icon?.includes("facebook") || link.isSvg === "facebook";

        return (
          <a
            key={link.id || link.title}
            href={link.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.title}
            title={link.title}
            className="social-link-btn"
          >
            {isInsta ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            ) : isFb ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            ) : (
              <i className={`fab ${link.icon || "fa-share-alt"}`}></i>
            )}
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
