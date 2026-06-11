import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contact/my-messages");
      setMessages(res.data.data);
      if (res.data.data.length > 0 && !selectedTicket) {
        setSelectedTicket(res.data.data[0]);
      }
    } catch (err) {
      toast.error("Failed to load your messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f6eaea", minHeight: "100vh" }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "30px", color: "#2f2f2f" }}>My Support Tickets</h2>
        
        <div style={{ display: "flex", gap: "20px", height: "70vh", minHeight: "500px" }}>
          
          {/* Left Panel - Ticket List */}
          <div style={{ flex: "0 0 300px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No messages found.</div>
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

                  {/* Old reply logic fallback if they used the old system */}
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
                    disabled={submitting || !replyText.trim()}
                    style={{ 
                      background: "#2f2f2f", color: "#fff", border: "none", padding: "0 25px", borderRadius: "25px", cursor: submitting || !replyText.trim() ? "not-allowed" : "pointer", fontWeight: "600", opacity: submitting || !replyText.trim() ? 0.7 : 1
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
      <Footer />
    </div>
  );
}
