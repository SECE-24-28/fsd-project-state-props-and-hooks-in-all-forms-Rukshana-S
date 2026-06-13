import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function AdminMessages() {
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
      const res = await api.get("/contact/admin");
      setMessages(res.data.data);
      if (res.data.data.length > 0 && !selectedTicket) {
        setSelectedTicket(res.data.data[0]);
      }
    } catch (err) {
      toast.error("Failed to fetch messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/contact/reply/${selectedTicket._id}`, { replyMessage: replyText });
      toast.success("Reply sent successfully");
      
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
    <div className="adm-page" style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      <div className="adm-header" style={{ marginBottom: "20px", flexShrink: 0 }}>
        <h2 className="adm-title">Customer Support Tickets</h2>
      </div>

      <div className="adm-msg-layout">
        
        {/* Left Panel */}
        <div className="adm-card adm-msg-sidebar" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "15px", borderBottom: "1px solid #eee", background: "#f8f9fa", fontWeight: "600" }}>
            All Conversations
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No messages found.</div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg._id} 
                  onClick={() => setSelectedTicket(msg)}
                  style={{ 
                    padding: "15px", 
                    borderBottom: "1px solid #eee", 
                    cursor: "pointer",
                    background: selectedTicket?._id === msg._id ? "#f0f4f8" : "#fff",
                    borderLeft: selectedTicket?._id === msg._id ? "4px solid #2f2f2f" : "4px solid transparent"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <strong style={{ color: "#2f2f2f" }}>{msg.name}</strong>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {msg.subject || msg.message}
                  </div>
                  <span className="adm-badge" style={{ 
                    backgroundColor: msg.status === "Replied" ? "#e6f4ea" : "#fff3e0", 
                    color: msg.status === "Replied" ? "#1e8e3e" : "#e67c73" 
                  }}>
                    {msg.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="adm-card adm-msg-chat" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: "20px", borderBottom: "1px solid #eee", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedTicket.name}</h3>
                    <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "0.9rem" }}>{selectedTicket.email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#999" }}>Ticket ID: {selectedTicket._id.slice(-6)}</p>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", background: "#fdfdfd" }}>
                
                {/* Initial Ticket Message */}
                <div style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
                  <div style={{ background: "#f7eaed", color: "#2f2f2f", padding: "12px 16px", borderRadius: "18px 18px 18px 0", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                    <strong>{selectedTicket.subject}</strong><br/>
                    {selectedTicket.message}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#999", textAlign: "left", marginTop: "4px" }}>
                    {selectedTicket.name} • {new Date(selectedTicket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies && selectedTicket.replies.map((reply, idx) => (
                  <div key={idx} style={{ alignSelf: reply.sender === "admin" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                    <div style={{ 
                      background: reply.sender === "admin" ? "#2f2f2f" : "#f7eaed", 
                      color: reply.sender === "admin" ? "#fff" : "#2f2f2f", 
                      padding: "12px 16px", 
                      borderRadius: reply.sender === "admin" ? "18px 18px 0 18px" : "18px 18px 18px 0", 
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      whiteSpace: "pre-wrap"
                    }}>
                      {reply.message}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#999", textAlign: reply.sender === "admin" ? "right" : "left", marginTop: "4px" }}>
                      {reply.sender === "admin" ? "You" : selectedTicket.name} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}

                {/* Fallback for old system */}
                {selectedTicket.replyMessage && (!selectedTicket.replies || selectedTicket.replies.length === 0) && (
                  <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
                    <div style={{ background: "#2f2f2f", color: "#fff", padding: "12px 16px", borderRadius: "18px 18px 0 18px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", whiteSpace: "pre-wrap" }}>
                      {selectedTicket.replyMessage}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#999", textAlign: "right", marginTop: "4px" }}>
                      You • {new Date(selectedTicket.repliedAt || selectedTicket.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Footer */}
              <div style={{ padding: "20px", borderTop: "1px solid #eee", background: "#fff", display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type a reply to the customer..." 
                  className="adm-input"
                  style={{ flex: 1, borderRadius: "25px", margin: 0 }}
                />
                <button 
                  onClick={handleSendReply}
                  disabled={submitting || !replyText.trim()}
                  className="adm-btn adm-btn-primary"
                  style={{ borderRadius: "25px", padding: "0 25px", opacity: submitting || !replyText.trim() ? 0.7 : 1 }}
                >
                  {submitting ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
              Select a ticket to view conversation
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
