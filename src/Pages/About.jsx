import React from "react";
import "../Assets/Css/about.css";
import c1 from "../Assets/images/collection1.jpg";
import c5 from "../Assets/images/collection5.jpg";

export default function About() {
  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="about-layout">
            {/* Hero */}
            <div className="about-hero">
              <h1>Our Story</h1>
              <p>WEARLY was born from a love of luxury fashion and a desire to make it accessible. We believe every wardrobe deserves a touch of elegance.</p>
            </div>

            {/* Mission */}
            <div className="about-content-row">
              <div className="about-img-wrap">
                <img src={c1} alt="Our Mission" />
              </div>
              <div className="about-text">
                <h2>Our Mission</h2>
                <p>At WEARLY, we curate the finest clothing from India's most beloved brands — bringing luxury boutique experiences directly to your doorstep.</p>
                <p>We partner with verified designers and artisans to ensure every piece tells a story of craftsmanship, quality, and timeless style.</p>
                <p>From pastel tees to ornate silk sarees, our collection spans every occasion, every mood, and every style identity.</p>
              </div>
            </div>

            {/* Vision */}
            <div className="about-content-row" style={{ direction: "rtl" }}>
              <div className="about-img-wrap">
                <img src={c5} alt="Our Vision" style={{ direction: "ltr" }} />
              </div>
              <div className="about-text" style={{ direction: "ltr" }}>
                <h2>Our Vision</h2>
                <p>We envision a world where fashion is inclusive, sustainable, and deeply personal. WEARLY is building the future of Indian luxury retail — one beautiful outfit at a time.</p>
                <p>Our goal is to become India's most trusted fashion destination, celebrated for authenticity, curation, and an unmatched shopping experience.</p>
              </div>
            </div>

            {/* Values */}
            <div className="section-header">
              <div className="section-title-wrap">
                <h2 className="section-title">Why Choose WEARLY</h2>
                <p className="section-desc">Our fashion values define everything we do.</p>
              </div>
            </div>
            <div className="about-vision-cards" style={{ marginBottom: "70px" }}>
              {[
                { icon: "✨", title: "100% Authentic", desc: "Every product is sourced directly from verified brand partners and authorized distributors." },
                { icon: "🚚", title: "Fast Delivery", desc: "Express delivery across India. Free shipping on orders above ₹999." },
                { icon: "↩️", title: "Easy Returns", desc: "Hassle-free 15-day return and exchange policy. No questions asked." },
                { icon: "💎", title: "Luxury Curation", desc: "Hand-picked styles from India's finest fashion labels and emerging designers." },
                { icon: "🌿", title: "Sustainable Fashion", desc: "We prioritize eco-conscious brands and sustainable fabric choices." },
                { icon: "💬", title: "24/7 Support", desc: "Our dedicated style consultants are always here to help you find the perfect look." },
              ].map((v, i) => (
                <div key={i} className="vision-card">
                  <div className="vision-icon">{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
