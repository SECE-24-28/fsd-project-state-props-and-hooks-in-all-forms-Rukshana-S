import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { User, Package, MapPinned, Settings, LogOut, Crown, Lock, Phone, Trash2, Edit2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import "../Assets/Css/profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [profileUser, setProfileUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: "Home", name: "", phone: "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: false });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangeNumber, setShowChangeNumber] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [passwords, setPasswords] = useState({ newPass: "", confirmPass: "" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchProfileData();
  }, []);

  const fetchProfileData = () => {
    api.get("/users/profile").then(res => setProfileUser(res.data.data)).catch(err => console.error(err));
    api.get("/orders").then(res => setOrders(res.data.data)).catch(err => console.error(err));
    api.get("/users/address").then(res => setAddresses(res.data.data)).catch(err => console.error(err));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.put(`/users/address/${editingAddress._id}`, addressForm);
        toast.success("Address updated");
      } else {
        await api.post("/users/address", addressForm);
        toast.success("Address added");
      }
      setShowAddressModal(false);
      fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/users/address/${id}`);
      toast.success("Address deleted");
      fetchProfileData();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const openAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({ ...addr });
    } else {
      setEditingAddress(null);
      setAddressForm({ label: "Home", name: profileUser?.name || "", phone: profileUser?.phone || "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: addresses.length === 0 });
    }
    setShowAddressModal(true);
  };

  const handleUpdateProfile = async (e, type) => {
    e.preventDefault();
    try {
      let payload = {};
      if (type === 'name') payload.name = editName;
      if (type === 'phone') payload.phone = editPhone;
      if (type === 'password') {
        if (passwords.newPass !== passwords.confirmPass) {
          return toast.error("Passwords do not match");
        }
        payload.password = passwords.newPass;
      }
      
      await api.put("/users/profile", payload);
      toast.success("Profile updated successfully");
      setShowEditProfile(false);
      setShowChangeNumber(false);
      setShowChangePassword(false);
      setPasswords({ newPass: "", confirmPass: "" });
      fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    try {
      await api.delete("/users/profile");
      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  if (!user && !profileUser) return <div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>;

  const displayUser = profileUser || user;
  const initial = displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : "U";

  const getStatusClass = (status) => {
    if (!status) return "";
    if (status.toLowerCase() === "delivered") return "status-Delivered";
    if (status.toLowerCase().includes("out for delivery")) return "status-Out-For-Delivery";
    if (status.toLowerCase() === "cancelled") return "status-Cancelled";
    return "status-Pending";
  };

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container profile-layout">
          
          {/* ── SIDEBAR ── */}
          <aside className="profile-sidebar">
            <h3>My Account</h3>
            <ul className="profile-nav">
              <li className={`profile-nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => {setActiveTab("profile"); window.scrollTo({top:0, behavior:"smooth"});}}>
                <User /> Profile
              </li>
              <li className={`profile-nav-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => {setActiveTab("orders"); window.scrollTo({top:0, behavior:"smooth"});}}>
                <Package /> Orders
              </li>
              <li className={`profile-nav-item ${activeTab === "address" ? "active" : ""}`} onClick={() => {setActiveTab("address"); window.scrollTo({top:0, behavior:"smooth"});}}>
                <MapPinned /> Address Book
              </li>
              <li className={`profile-nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => {setActiveTab("settings"); window.scrollTo({top:0, behavior:"smooth"});}}>
                <Settings /> Account Settings
              </li>
              <li className="profile-nav-item logout" onClick={handleLogout}>
                <LogOut /> Logout
              </li>
            </ul>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="profile-main">
            
            {activeTab === "profile" && (
              <>
                {/* Profile Header Card */}
                <div className="profile-card profile-header-card">
                  <div className="profile-avatar">{initial}</div>
                  <div className="profile-info">
                    <h2>{displayUser?.name}</h2>
                    <p>{displayUser?.email}</p>
                    <p>{displayUser?.phone || "No phone number added"}</p>
                    <div className="profile-actions">
                      <button className="btn-secondary" style={{ padding: "8px 16px", borderRadius: "8px" }} onClick={() => { setEditName(displayUser?.name || ""); setShowEditProfile(true); }}>Edit Profile</button>
                      <button className="btn-outline" style={{ padding: "8px 16px", borderRadius: "8px" }} onClick={() => { setEditPhone(displayUser?.phone || ""); setShowChangeNumber(true); }}>Change Number</button>
                    </div>
                  </div>
                </div>

                {/* Membership Card */}
                {displayUser?.isPremium ? (
                  <div className="profile-card premium-card">
                    <div className="premium-content">
                      <div className="premium-icon"><Crown size={32} /></div>
                      <div className="premium-text">
                        <h3>WEARLY Premium</h3>
                        <p>Member Since: {new Date(displayUser.premiumSince).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="profile-card normal-user-card">
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#333", marginBottom: "8px" }}>Normal User</h3>
                    <p style={{ color: "#666" }}>Upgrade to WEARLY Premium for exclusive drops and priority support.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "orders" && (
              <div className="profile-card">
                <div className="profile-card-header">Recent Orders</div>
                {orders.length === 0 ? <p style={{ color: "#666" }}>You have no recent orders.</p> : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order._id} className="order-card">
                        <div className="order-header">
                          <div className="order-id-wrap">
                            <span className="order-id">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <span className={`order-status ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                        </div>
                        <div className="order-body">
                          <span className="order-amount">₹{order.amount.toLocaleString("en-IN")}</span>
                          <div className="order-actions">
                            <button className="btn-outline" onClick={() => navigate(`/orders/${order._id}`)}>Track Order</button>
                            <button className="btn-outline" onClick={() => navigate(`/receipt/${order._id}`)}>Receipt</button>
                            <button className="btn-primary" onClick={() => navigate(`/orders/${order._id}`)}>View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div className="profile-card">
                <div className="profile-card-header">Address Book</div>
                <div className="address-grid">
                  {addresses.map(addr => (
                    <div key={addr._id} className={`address-card ${addr.isDefault ? "default" : ""}`}>
                      <span className="address-label">{addr.label} {addr.isDefault && "(Default)"}</span>
                      <h4 className="address-name">{addr.name}</h4>
                      <p className="address-details">
                        {addr.phone}<br/>
                        {addr.street}<br/>
                        {addr.city}, {addr.state} {addr.pincode}<br/>
                        {addr.country}
                      </p>
                      <div className="address-actions">
                        <button className="btn-edit" onClick={() => openAddressModal(addr)}><Edit2 size={16} /> Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteAddress(addr._id)}><Trash2 size={16} /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-add-address" onClick={() => openAddressModal()}>
                  <Plus size={20} /> Add New Address
                </button>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="profile-card">
                <div className="profile-card-header">Account Settings</div>
                <div className="settings-list">
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-icon"><Lock size={24} /></div>
                      <div className="setting-text">
                        <h4>Change Password</h4>
                        <p>Update your password to keep your account secure</p>
                      </div>
                    </div>
                    <div className="setting-action"><button className="btn-outline" onClick={() => setShowChangePassword(true)}>Update</button></div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-icon"><Phone size={24} /></div>
                      <div className="setting-text">
                        <h4>Change Phone Number</h4>
                        <p>Update your registered mobile number</p>
                      </div>
                    </div>
                    <div className="setting-action"><button className="btn-outline" onClick={() => { setEditPhone(displayUser?.phone || ""); setShowChangeNumber(true); }}>Update</button></div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-icon"><MapPinned size={24} /></div>
                      <div className="setting-text">
                        <h4>Manage Addresses</h4>
                        <p>Add, edit or delete your delivery addresses</p>
                      </div>
                    </div>
                    <div className="setting-action"><button className="btn-outline" onClick={() => setActiveTab("address")}>Manage</button></div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-icon" style={{ color: "#dc2626", background: "#fef2f2" }}><Trash2 size={24} /></div>
                      <div className="setting-text">
                        <h4 style={{ color: "#dc2626" }}>Delete Account</h4>
                        <p>Permanently remove your account and data</p>
                      </div>
                    </div>
                    <div className="setting-action"><button className="btn-outline" style={{ borderColor: "#dc2626", color: "#dc2626" }} onClick={handleDeleteAccount}>Delete</button></div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
              <button className="btn-close" onClick={() => setShowAddressModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-group">
                <label>Address Label (e.g., Home, Office)</label>
                <input type="text" className="form-control" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-control" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="form-control" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Street & Area</label>
                <input type="text" className="form-control" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-control" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" className="form-control" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" className="form-control" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" className="form-control" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} required />
                </div>
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                <label htmlFor="isDefault" style={{ margin: 0 }}>Set as Default Address</label>
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>Save Address</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="btn-close" onClick={() => setShowEditProfile(false)}><X size={24}/></button>
            </div>
            <form onSubmit={(e) => handleUpdateProfile(e, 'name')}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Change Number Modal */}
      {showChangeNumber && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change Phone Number</h3>
              <button className="btn-close" onClick={() => setShowChangeNumber(false)}><X size={24}/></button>
            </div>
            <form onSubmit={(e) => handleUpdateProfile(e, 'phone')}>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>Update Number</button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="btn-close" onClick={() => setShowChangePassword(false)}><X size={24}/></button>
            </div>
            <form onSubmit={(e) => handleUpdateProfile(e, 'password')}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" className="form-control" value={passwords.confirmPass} onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} required minLength={6} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>Update Password</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
