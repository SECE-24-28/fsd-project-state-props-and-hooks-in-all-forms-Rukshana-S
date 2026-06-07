import React from "react";
import "../Assets/Css/about.css";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By browsing, registering, or purchasing from WEARLY, users agree to these terms and all applicable laws.",
  },
  {
    title: "2. Products and Pricing",
    list: [
      "All prices are displayed in INR.",
      "Prices may change without prior notice.",
      "Product images are for representation purposes and slight variations may occur.",
    ],
  },
  {
    title: "3. Orders and Payments",
    list: [
      "Orders are confirmed only after successful payment or order confirmation.",
      "WEARLY reserves the right to cancel suspicious or fraudulent orders.",
    ],
  },
  {
    title: "4. Shipping and Delivery",
    list: [
      "Delivery timelines may vary by location.",
      "Delays due to logistics or unforeseen circumstances may occur.",
    ],
  },
  {
    title: "5. Returns and Refunds",
    list: [
      "Eligible products may be returned within 7 days of delivery.",
      "Refunds are processed after product inspection.",
      "Customized products may not be eligible for return.",
    ],
  },
  {
    title: "6. User Accounts",
    content: "Users are responsible for maintaining the confidentiality of their account credentials. WEARLY is not liable for unauthorized access resulting from user negligence.",
  },
  {
    title: "7. Intellectual Property",
    content: "All website content, logos, images, graphics, designs, and text belong to WEARLY and may not be copied, reproduced, or distributed without prior written permission.",
  },
  {
    title: "8. Limitation of Liability",
    content: "WEARLY shall not be liable for indirect, incidental, or consequential damages arising from website usage or product purchases beyond the value of the order placed.",
  },
  {
    title: "9. Privacy",
    content: "Use of customer information is governed by the WEARLY Privacy Policy, which forms an integral part of these Terms & Conditions.",
  },
  {
    title: "10. Governing Law",
    content: "These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Coimbatore, Tamil Nadu.",
  },
  {
    title: "11. Contact Information",
    contact: true,
  },
];

export default function TermsConditions() {
  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="legal-layout">
            <div className="legal-card">
              <h1 className="legal-title">Terms &amp; Conditions</h1>
              <p className="legal-meta">Last Updated: June 2026</p>
              <p className="legal-intro">
                By accessing and using the WEARLY website, you agree to comply with these Terms &amp; Conditions. Please read them carefully before making a purchase or creating an account.
              </p>
              <div className="legal-content">
                {SECTIONS.map((s, i) => (
                  <div key={i} className="legal-section">
                    <h3>{s.title}</h3>
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
