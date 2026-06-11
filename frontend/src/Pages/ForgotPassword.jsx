import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../Assets/Css/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Steps: 1 = Email, 2 = OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate password regex
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email: email.trim().toLowerCase() });
      setStep(2);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    // Proceed to reset password step. Actual verification happens on final submit.
    setStep(3);
    setError("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must contain uppercase, lowercase and number. Min 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/reset-password", { 
        email: email.trim().toLowerCase(), 
        otp: otp.trim(),
        password 
      });
      setStep(4);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-page">
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card premium-card" style={{ borderRadius: "20px" }}>
        
        {step === 1 && (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Forgot Password</h2>
              <p className="auth-subtitle">Enter your email and we'll send you an OTP</p>
            </div>
            <form onSubmit={handleSendOtp} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className={`input-wrapper${error ? " input-error" : ""}`}>
                  <input
                    type="email" placeholder="you@example.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="field-error">{error}</p>}
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading} style={{ borderRadius: "25px" }}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Verify OTP</h2>
              <p className="auth-subtitle">Enter the 6-digit OTP sent to {email}</p>
            </div>
            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="form-group">
                <label className="form-label">One Time Password</label>
                <div className={`input-wrapper${error ? " input-error" : ""}`}>
                  <input
                    type="text" placeholder="123456" value={otp}
                    onChange={e => { setOtp(e.target.value); setError(""); }}
                    maxLength={6}
                  />
                </div>
                {error && <p className="field-error">{error}</p>}
              </div>
              <button type="submit" className="btn-primary auth-btn" style={{ borderRadius: "25px" }}>
                Verify OTP
              </button>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <span style={{ color: "#b8929a", cursor: "pointer" }} onClick={() => setStep(1)}>
                  Change Email
                </span>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">Create a strong new password</p>
            </div>
            <form onSubmit={handleResetPassword} noValidate>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className={`input-wrapper${error && error.includes("Password must contain") ? " input-error" : ""}`} style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min 8 chars, 1 uppercase, 1 number" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                  />
                  <span 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "1.2rem" }}
                  >
                    {showPassword ? "👁" : "🙈"}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className={`input-wrapper${error && error.includes("match") ? " input-error" : ""}`} style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm your new password" 
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                  />
                  <span 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "1.2rem" }}
                  >
                    {showConfirmPassword ? "👁" : "🙈"}
                  </span>
                </div>
                {error && <p className="field-error">{error}</p>}
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading} style={{ borderRadius: "25px" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="success-card" style={{ borderRadius: "20px" }}>
            <h4>Password reset successful! 🎉</h4>
            <p>Your password has been successfully updated. Redirecting to login...</p>
          </div>
        )}

        {step < 4 && (
          <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
        )}
      </div>
    </div>
  );
}
