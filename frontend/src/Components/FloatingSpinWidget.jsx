import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../Assets/Css/floatingSpinWidget.css";

const FloatingSpinWidget = () => {
  const [spinStatus, setSpinStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const fetchStatus = async () => {
      if (!user) {
        if (isMounted) {
          setSpinStatus({ canSpin: false, error: true });
          setLoading(false);
        }
        return;
      }
      
      try {
        const res = await api.get("/spin/status");
        if (isMounted) {
          setSpinStatus(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch spin status:", err);
        if (isMounted) {
          setSpinStatus({ canSpin: false, error: true });
          setLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleClick = () => {
    navigate("/spin-wheel");
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  // If there's an error (e.g. unauthenticated) or we couldn't fetch data, show unavailable state
  if (spinStatus?.error) {
    return (
      <div className="floating-spin-widget" onClick={handleClick}>
        <div className="fsw-icon">🎁</div>
        <div className="fsw-content">
          <p className="fsw-title">Spin & Win</p>
          <p className="fsw-status fsw-unavailable">Spin unavailable</p>
        </div>
      </div>
    );
  }

  const { canSpin, daysLeft } = spinStatus || {};

  return (
    <div 
      className={`floating-spin-widget ${canSpin ? "fsw-floating" : ""}`} 
      onClick={handleClick}
    >
      <div className="fsw-icon">🎁</div>
      <div className="fsw-content">
        <p className="fsw-title">Spin & Win</p>
        {canSpin ? (
          <p className="fsw-status fsw-available">
            <span className="fsw-pulse-badge"></span>
            Available
          </p>
        ) : (
          <p className="fsw-status fsw-unavailable">
            Next spin: {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingSpinWidget;
