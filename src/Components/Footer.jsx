import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Assets/Css/footer.css";

export default function Footer() {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <span className="footer-brand">WEARLY</span>
            <p className="footer-brand-desc">Luxury pastel fashion for the modern soul. Curated styles, timeless elegance.</p>
            <div className="footer-socials">
              {["FB", "IG", "TW", "YT"].map((icon, i) => (
                <button key={i} className="footer-social-btn">{icon}</button>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore Boutique</h4>
            <ul>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/")}>Home</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/products")}>Products</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/products?filter=top")}>Top Trends</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/products?filter=brands")}>Brands</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/products?category=ethnic")}>Ethnic Wear</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/contact")}>Contact</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/about")}>Our Brand Story</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/contact")}>Contact Support</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/faq")}>Frequently Asked Questions</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/privacy-policy")}>Privacy Compliance Policy</button></li>
              <li><button className="footer-nav-btn" onClick={() => handleNav("/terms")}>Boutique Terms &amp; Conditions</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Our Flagship Stores</h4>
            <ul className="footer-contact-info">
              <li>126 D/10 A, Gandhipuram, Coimbatore - 641001</li>
              <li>+91 11-4567-8900 / +91 98765-43210</li>
              <li>hello@wearly.com</li>
              <li>Open Mon - Sun: 10:00 AM - 9:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2025 WEARLY. All rights reserved.</span>
          <span>Crafted with love for fashion lovers</span>
        </div>
      </div>
    </footer>
  );
}
