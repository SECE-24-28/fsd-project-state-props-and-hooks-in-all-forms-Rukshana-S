import React from "react";
import "../Assets/Css/about.css";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: null,
    list: ["Name", "Email Address", "Phone Number", "Shipping Address", "Billing Address", "Account Information", "Order History"],
  },
  {
    title: "2. How We Use Your Information",
    content: null,
    list: ["Process and deliver orders", "Provide customer support", "Improve shopping experience", "Send order updates", "Respond to inquiries", "Prevent fraud and misuse"],
  },
  {
    title: "3. Cookies and Tracking Technologies",
    content: "WEARLY may use cookies to improve website performance, remember user preferences, and provide a better browsing experience. You may disable cookies in your browser settings, though some features may not function as intended.",
  },
  {
    title: "4. Data Security",
    content: "We implement reasonable security measures to protect customer information from unauthorized access, disclosure, or misuse. All payment transactions are routed through PCI-DSS certified gateways.",
  },
  {
    title: "5. Sharing of Information",
    content: "WEARLY does not sell, rent, or trade customer personal information to third parties. Information may only be shared with delivery partners and payment providers strictly to complete your orders.",
  },
  {
    title: "6. User Rights",
    content: null,
    list: ["Access their account information", "Request corrections", "Update profile details", "Delete their account information where applicable"],
    prefix: "Customers may:",
  },
  {
    title: "7. Children's Privacy",
    content: "WEARLY services are intended for users above 18 years of age. We do not knowingly collect information from children.",
  },
  {
    title: "8. Changes to this Privacy Policy",
    content: "WEARLY reserves the right to update this policy. Any changes will be reflected on this page with an updated revision date.",
  },
  {
    title: "9. Contact Us",
    content: null,
    contact: true,
  },
];

export default function PrivacyPolicy() {
  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="legal-layout">
            <div className="legal-card">
              <h1 className="legal-title">Privacy Policy</h1>
              <p className="legal-meta">Last Updated: June 2026</p>
              <p className="legal-intro">
                At WEARLY, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website or purchase products from us.
              </p>
              <div className="legal-content">
                {SECTIONS.map((s, i) => (
                  <div key={i} className="legal-section">
                    <h3>{s.title}</h3>
                    {s.prefix && <p>{s.prefix}</p>}
                    {s.content && <p>{s.content}</p>}
                    {s.list && (
                      <ul className="legal-list">
                        {s.list.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    )}
                    {s.contact && (
                      <div className="legal-contact-block">
                        <p><strong>WEARLY Customer Support</strong></p>
                        <p>Email: <a href="mailto:hello@wearly.com">hello@wearly.com</a></p>
                        <p>Phone: +91 11-4567-8900</p>
                        <p>Address: 126 D/10 A, Gandhipuram, Coimbatore - 641001</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
