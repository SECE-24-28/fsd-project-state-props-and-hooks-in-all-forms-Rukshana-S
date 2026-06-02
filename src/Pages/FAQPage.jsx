import React, { useState } from "react";

const faqs = [
  { q: "How long does delivery take?", a: "Standard delivery takes 3–7 business days. Express delivery (1–2 days) is available for select pin codes across India." },
  { q: "Can I return or exchange products?", a: "Yes! We offer hassle-free returns and exchanges within 15 days of delivery. Items must be unused with original tags intact." },
  { q: "Do you offer Cash on Delivery?", a: "Yes, Cash on Delivery is available for orders up to ₹10,000 across most pin codes in India." },
  { q: "How can I track my order?", a: "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track from your account dashboard." },
  { q: "Are all products authentic?", a: "Absolutely. WEARLY sources directly from verified brand partners and authorized distributors. Every product is 100% authentic." },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, UPI, net banking, wallets, and Cash on Delivery for eligible orders." },
  { q: "How do I cancel an order?", a: "Orders can be cancelled within 24 hours of placement. Contact our support team at hello@wearly.com or call us directly." },
  { q: "Is my personal data safe?", a: "Yes. We use PCI-DSS certified payment gateways and never store card credentials. Your data is protected per our Privacy Compliance Policy." },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 0 70px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: "12px" }}>
                Frequently Asked Questions
              </h1>
              <p style={{ color: "var(--text-light)", fontSize: "1rem" }}>
                Everything you need to know about shopping at WEARLY.
              </p>
            </div>
            <div className="faq-accordion">
              {faqs.map((faq, i) => (
                <div key={i} className={`faq-item${open === i ? " active" : ""}`}>
                  <div className="faq-trigger" onClick={() => setOpen(open === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className="faq-trigger-icon">+</span>
                  </div>
                  <div className="faq-content">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
