import React, { useState } from "react";

const faqs = [
  { q: "How long does delivery take?", a: "Standard delivery takes 3–7 business days. Express delivery (1–2 days) is available for select pin codes across India." },
  { q: "Can I return or exchange products?", a: "Yes! We offer hassle-free returns and exchanges within 15 days of delivery. Items must be unused with original tags intact." },
  { q: "Do you offer Cash on Delivery?", a: "Yes, Cash on Delivery is available for orders up to ₹10,000 across most pin codes in India." },
  { q: "How can I track my order?", a: "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track from your account dashboard." },
  { q: "Are all products authentic?", a: "Absolutely. WEARLY sources directly from verified brand partners and authorized distributors. Every product is 100% authentic." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="container" style={{ marginBottom: "70px" }}>
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Everything you need to know about shopping at WEARLY.</p>
        </div>
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
    </section>
  );
}
