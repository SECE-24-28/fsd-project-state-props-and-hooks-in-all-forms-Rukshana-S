import React, { useState } from "react";
import "../Assets/Css/contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) setSubmitted(true);
  };

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="contact-layout">
            {/* Form */}
            <div className="contact-form-card">
              <h2>Get in Touch</h2>
              <p>Have a question or need styling advice? We'd love to hear from you.</p>
              {submitted ? (
                <div className="success-card">
                  <h4>Message Sent! 🎉</h4>
                  <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-wrapper">
                      <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-wrapper">
                      <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" placeholder="Tell us how we can help..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: "100%" }}>Send Message</button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="contact-info-col">
              {[
                { icon: "📍", title: "Visit Us", lines: ["126 D/10 A, Gandhipuram", "Coimbatore - 641001"] },
                { icon: "📞", title: "Call Us", lines: ["+91 98765 43210", "Mon–Sat: 10AM – 9PM"] },
                { icon: "✉️", title: "Email Us", lines: ["hello@wearly.in", "support@wearly.in"] },
              ].map((info, i) => (
                <div key={i} className="info-card">
                  <div className="info-icon">{info.icon}</div>
                  <div className="info-details">
                    <h3>{info.title}</h3>
                    {info.lines.map((l, j) => <p key={j}>{l}</p>)}
                  </div>
                </div>
              ))}

              <div className="map-card">
                <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "16px" }}>Find Our Store</h3>
                <div className="map-placeholder">
                  <div className="map-placeholder-icon">📍</div>
                  <p style={{ fontWeight: 600 }}>126 D/10 A, Gandhipuram</p>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-light)" }}>Coimbatore - 641001</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
