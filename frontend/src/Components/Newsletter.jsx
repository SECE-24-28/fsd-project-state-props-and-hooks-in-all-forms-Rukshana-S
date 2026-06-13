import React, { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const res = await api.post("/newsletter/subscribe", { email });
        if (res.data.success) {
          toast.success("⭐ Welcome to WEARLY Premium Membership!");
          setSubmitted(true);
          setEmail("");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
      }
    }
  };

  return (
    <section className="container" style={{ marginBottom: "70px" }}>
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h3>Stay in the Loop with WEARLY</h3>
          <p>Subscribe for exclusive drops, style edits, and members-only offers delivered straight to your inbox.</p>
        </div>
        <div>
          {submitted ? (
            <div className="success-card">
              <h4>You're in! 🎉</h4>
              <p>Welcome to the WEARLY family. Expect beautiful things.</p>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
