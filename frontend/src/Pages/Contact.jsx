import React, { useState, useEffect } from "react";
import "../Assets/Css/contact.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chat/Messages states
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await api.get("/contact/my-messages");
      setMessages(res.data.data);
      if (res.data.data.length > 0 && !selectedTicket) {
        setSelectedTicket(res.data.data[0]);
      }
    } catch (err) {
      // Silently fail if they don't have access or token issues
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      if (user) {
        fetchMessages(); // Refresh their messages
      }
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      const res = await api.put(`/contact/customer-reply/${selectedTicket._id}`, { text: replyText });
      toast.success("Reply sent");
      
      const updatedTicket = res.data.data;
      setMessages(messages.map(m => m._id === updatedTicket._id ? updatedTicket : m));
      setSelectedTicket(updatedTicket);
      setReplyText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
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
                <div className="contact-success" style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✓</div>
                  <h3 style={{ marginBottom: "10px", color: "#2f2f2f" }}>Message sent successfully.</h3>
                  <p style={{ color: "#666", marginBottom: "20px" }}>Super Admin will reply shortly.</p>
                  <button className="btn-primary" onClick={() => setSubmitted(false)}>Send Another Message</button>
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
                  <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </button>
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

          {/* User Chat Interface (Only shown if user is logged in and has messages) */}
          {user && messages.length > 0 && (
            <div style={{ marginTop: "60px" }}>
              <h2 style={{ marginBottom: "30px", color: "#2f2f2f", textAlign: "center", fontFamily: "'Playfair Display', serif" }}>My Support Tickets</h2>
              <div style={{ display: "flex", gap: "20px", height: "60vh", minHeight: "450px" }}>
                
                {/* Left Panel - Ticket List */}
                <div style={{ flex: "0 0 300px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", overflowY: "auto" }}>
                  {messagesLoading ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
                  ) : (
                    <div>
                      {messages.map(msg => (
                        <div 
                          key={msg._id} 
                          onClick={() => setSelectedTicket(msg)}
                          style={{ 
                            padding: "20px", 
                            borderBottom: "1px solid #eee", 
                            cursor: "pointer",
                            background: selectedTicket?._id === msg._id ? "#f7eaed" : "#fff",
                            transition: "background 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <strong style={{ color: "#2f2f2f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.subject || "Support Ticket"}</strong>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {msg.message}
                          </div>
                          <span style={{ 
                            fontSize: "0.75rem", 
                            padding: "4px 8px", 
                            borderRadius: "12px", 
                            background: msg.status === "Replied" ? "#e6f4ea" : "#fff3e0", 
                            color: msg.status === "Replied" ? "#1e8e3e" : "#e67c73" 
                          }}>
                            {msg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Panel - Chat Area */}
                <div style={{ flex: "1", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {selectedTicket ? (
                    <>
                      <div style={{ padding: "20px", borderBottom: "1px solid #eee", background: "#f8f9fa" }}>
                        <h3 style={{ margin: 0, color: "#2f2f2f" }}>{selectedTicket.subject}</h3>
                        <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "0.9rem" }}>Started on {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div style={{ flex: "1", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", background: "#fdfdfd" }}>
                        
                        {/* Initial Message */}
                        <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
                          <div style={{ background: "#f7eaed", color: "#2f2f2f", padding: "12px 16px", borderRadius: "18px 18px 0 18px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                            {selectedTicket.message}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#999", textAlign: "right", marginTop: "4px" }}>
                            You • {new Date(selectedTicket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>

                        {/* Replies */}
                        {selectedTicket.replies && selectedTicket.replies.map((reply, idx) => (
                          <div key={idx} style={{ alignSelf: reply.sender === "admin" ? "flex-start" : "flex-end", maxWidth: "70%" }}>
                            <div style={{ 
                              background: reply.sender === "admin" ? "#ffffff" : "#f7eaed", 
                              border: reply.sender === "admin" ? "1px solid #eee" : "none",
                              color: "#2f2f2f", 
                              padding: "12px 16px", 
                              borderRadius: reply.sender === "admin" ? "18px 18px 18px 0" : "18px 18px 0 18px", 
                              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                              whiteSpace: "pre-wrap"
                            }}>
                              {reply.message}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#999", textAlign: reply.sender === "admin" ? "left" : "right", marginTop: "4px" }}>
                              {reply.sender === "admin" ? "WEARLY Support" : "You"} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        ))}

                        {/* Old reply logic fallback */}
                        {selectedTicket.replyMessage && (!selectedTicket.replies || selectedTicket.replies.length === 0) && (
                          <div style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
                            <div style={{ background: "#ffffff", border: "1px solid #eee", color: "#2f2f2f", padding: "12px 16px", borderRadius: "18px 18px 18px 0", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", whiteSpace: "pre-wrap" }}>
                              {selectedTicket.replyMessage}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#999", textAlign: "left", marginTop: "4px" }}>
                              WEARLY Support • {new Date(selectedTicket.repliedAt || selectedTicket.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        )}

                      </div>

                      <div style={{ padding: "20px", borderTop: "1px solid #eee", display: "flex", gap: "10px", background: "#fff" }}>
                        <input 
                          type="text" 
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                          placeholder="Continue conversation..." 
                          style={{ flex: "1", padding: "12px 20px", borderRadius: "25px", border: "1px solid #ddd", outline: "none", fontSize: "1rem" }}
                        />
                        <button 
                          onClick={handleSendReply}
                          disabled={replying || !replyText.trim()}
                          style={{ 
                            background: "#2f2f2f", color: "#fff", border: "none", padding: "0 25px", borderRadius: "25px", cursor: replying || !replyText.trim() ? "not-allowed" : "pointer", fontWeight: "600", opacity: replying || !replyText.trim() ? 0.7 : 1
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                      Select a conversation to view details
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

