import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "../Assets/Css/homepage.css";

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    api.get(`/receipts/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(err => {
        console.error(err);
      });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    if (!input) return;
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`WEARLY_Receipt_${order.receiptNumber || id}.pdf`);
    });
  };

  if (!order) return <div style={{ padding: "100px", textAlign: "center" }}>Loading Receipt...</div>;

  const subtotal = order.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container" style={{ margin: "40px auto", maxWidth: "800px" }}>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }} className="no-print">
            <button className="btn-secondary" onClick={() => navigate("/")}>Back Home</button>
            <button className="btn-secondary" onClick={handlePrint}>Print Receipt</button>
            <button className="btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
          </div>

          <div ref={receiptRef} style={{ background: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #eee" }} className="receipt-content">
            <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
              <h1 style={{ fontSize: "2rem", letterSpacing: "2px", margin: "0 0 10px" }}>WEARLY</h1>
              <h2 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>Order Receipt</h2>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", fontSize: "0.95rem" }}>
              <div>
                <p style={{ margin: "5px 0" }}><strong>Receipt Number:</strong> {order.receiptNumber || "N/A"}</p>
                <p style={{ margin: "5px 0" }}><strong>Order ID:</strong> {order._id}</p>
                <p style={{ margin: "5px 0" }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "5px 0" }}><strong>Customer Name:</strong> {order.userId?.name || "N/A"}</p>
                <p style={{ margin: "5px 0" }}><strong>Email:</strong> {order.userId?.email || "N/A"}</p>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left", background: "#f9f9f9" }}>
                  <th style={{ padding: "12px" }}>Products</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Quantity</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Price</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{item.name} {item.size ? `(${item.size})` : ""}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>₹{item.price.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <table style={{ width: "300px", fontSize: "0.95rem" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "5px 0" }}>Subtotal:</td>
                    <td style={{ textAlign: "right", padding: "5px 0" }}>₹{subtotal.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px 0" }}>GST:</td>
                    <td style={{ textAlign: "right", padding: "5px 0" }}>₹{(order.gstAmount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px 0" }}>Shipping:</td>
                    <td style={{ textAlign: "right", padding: "5px 0" }}>₹{(order.shippingCharge || 0).toLocaleString("en-IN")}</td>
                  </tr>
                  {order.appliedCoupon?.code && (
                    <tr>
                      <td style={{ padding: "5px 0", color: "#059669" }}>Coupon Discount:</td>
                      <td style={{ textAlign: "right", padding: "5px 0", color: "#059669" }}>- (Applied)</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="2"><hr style={{ border: 0, borderTop: "1px solid #ddd", margin: "10px 0" }}/></td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px 0", fontWeight: "bold", fontSize: "1.1rem" }}>Grand Total:</td>
                    <td style={{ textAlign: "right", padding: "5px 0", fontWeight: "bold", fontSize: "1.1rem" }}>₹{order.amount.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #eee", fontSize: "0.9rem", color: "#666" }}>
              <p style={{ margin: "5px 0" }}><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
              <p style={{ margin: "5px 0" }}><strong>Payment Status:</strong> {order.paymentStatus}</p>
            </div>

            <style>
              {`
                @media print {
                  body * { visibility: hidden; }
                  .receipt-content, .receipt-content * { visibility: visible; }
                  .receipt-content { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; padding: 0; }
                  .no-print { display: none !important; }
                }
              `}
            </style>
          </div>

        </div>
      </div>
    </main>
  );
}
