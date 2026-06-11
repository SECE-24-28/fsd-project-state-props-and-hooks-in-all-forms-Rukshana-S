import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import SpinWheelComponent from "../Components/SpinWheelComponent";
import api from "../services/api";
import "../Assets/Css/spinwheel.css";

const PRIZE_MAP = {
  "15_OFF": 0,
  "FREE_SHIPPING": 1,
  "NOT_LUCKY": 2,
  "25_OFF": 3
};

const SpinWheel = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinStatus, setSpinStatus] = useState(null); // { canSpin: true/false, daysLeft: 0 }
  const [showModal, setShowModal] = useState(false);
  const [prizeResult, setPrizeResult] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, couponsRes] = await Promise.all([
        api.get("/spin/status"),
        api.get("/coupons/my")
      ]);
      setSpinStatus(statusRes.data);
      setCoupons(couponsRes.data.coupons || []);
    } catch (error) {
      console.error("Error fetching spin data", error);
    }
    setLoading(false);
  };

  const handleSpinClick = async () => {
    if (!spinStatus?.canSpin || mustSpin) return;

    try {
      const res = await api.post("/spin");
      if (res.data.success) {
        setPrizeResult(res.data);
        
        // Map prize to wheel index
        let targetIndex = 0;
        if (res.data.prize === "15_OFF") targetIndex = 0;
        else if (res.data.prize === "25_OFF") targetIndex = 3;
        else if (res.data.prize === "FREE_SHIPPING") {
          targetIndex = Math.random() > 0.5 ? 1 : 4;
        } else {
          targetIndex = Math.random() > 0.5 ? 2 : 5;
        }
        
        setPrizeNumber(targetIndex);
        setMustSpin(true);
      }
    } catch (error) {
      console.error("Spin error", error);
    }
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setShowModal(true);
    fetchData(); // Refresh coupons and status
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopySuccess("Coupon copied successfully ✓");
    setTimeout(() => setCopySuccess(""), 3000);
  };

  const renderModalContent = () => {
    if (!prizeResult) return null;

    if (prizeResult.prize === "NOT_LUCKY") {
      return (
        <>
          <h2>Better luck next week!</h2>
          <p>Come back after 7 days.</p>
        </>
      );
    }

    const title = prizeResult.prize === "15_OFF" ? "15% OFF" : 
                 prizeResult.prize === "25_OFF" ? "25% OFF" : "Free Shipping unlocked";

    return (
      <>
        <h2>Congratulations!</h2>
        <p style={{ fontSize: "1.2rem", fontWeight: "600", margin: "10px 0" }}>You won {title}</p>
        <p style={{ color: "#666", marginBottom: "5px" }}>Coupon Code:</p>
        <div className="coupon-box" style={{ marginTop: 0 }}>
          <span className="coupon-code" style={{ letterSpacing: "1px", fontWeight: "bold" }}>{prizeResult.coupon}</span>
          <button className="copy-btn" onClick={() => handleCopy(prizeResult.coupon)}>
            Copy Code
          </button>
        </div>
        {copySuccess && <p style={{ color: "#059669", fontSize: "0.9rem", marginTop: "-10px", marginBottom: "15px" }}>{copySuccess}</p>}
      </>
    );
  };

  const formatPrizeType = (type) => {
    if (type === "15_OFF") return "15% OFF";
    if (type === "25_OFF") return "25% OFF";
    if (type === "FREE_SHIPPING") return "FREE SHIPPING";
    return type;
  };

  if (loading) {
    return <div className="spin-page" style={{ justifyContent: "center" }}><h2>Loading...</h2></div>;
  }

  return (
    <main className="spin-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      {showModal && prizeResult?.prize !== "NOT_LUCKY" && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="spin-header">
        <h1 className="spin-title">WEARLY Rewards</h1>
        <p className="spin-subtitle">Try your luck once every week and unlock exclusive rewards.</p>
      </div>

      <div className="spin-container">
        <SpinWheelComponent 
          mustSpin={mustSpin} 
          prizeNumber={prizeNumber} 
          onStopSpinning={onStopSpinning} 
        />

        {spinStatus?.canSpin ? (
          <button 
            className="spin-btn" 
            onClick={handleSpinClick}
            disabled={mustSpin}
          >
            SPIN NOW
          </button>
        ) : (
          <div className="spin-status-msg">
            You already used your weekly spin.
            <span>Next spin available in: {spinStatus?.daysLeft} days</span>
          </div>
        )}
      </div>

      <div className="rewards-section" style={{ width: "100%", maxWidth: "1000px" }}>
        <h2 className="rewards-title">Reward History</h2>
        {coupons.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>You don't have any rewards yet.</p>
        ) : (
          <div className="rewards-grid">
            {coupons.map((coupon) => (
              <div key={coupon._id} className={`reward-card ${coupon.used ? "used" : ""}`}>
                <div className={`reward-status ${coupon.used ? "status-used" : "status-unused"}`}>
                  {coupon.used ? "Used" : "Unused"}
                </div>
                <div className="reward-type">{formatPrizeType(coupon.type)}</div>
                <div className="reward-code">{coupon.code}</div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "8px" }}>
                  {new Date(coupon.createdAt).toLocaleDateString()}
                </div>
                {!coupon.used && (
                  <button 
                    className="copy-btn" 
                    style={{ marginTop: "10px", display: "block", width: "100%", padding: "8px 0" }}
                    onClick={() => handleCopy(coupon.code)}
                  >
                    Copy Code
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="spin-modal-overlay">
          <div className="spin-modal">
            {renderModalContent()}
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SpinWheel;
