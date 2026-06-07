import React, { useState, useRef, useMemo } from "react";
import "../styles/AdminProducts.css";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS = { active: "#059669", inactive: "#DC2626" };
const CATEGORIES = ["women", "men", "kids", "ethnic"];
const ACCEPTED = "image/jpg,image/jpeg,image/png,image/webp";

const EMPTY_FORM = {
  name: "", brand: "", category: "women",
  price: "", stock: "", description: "", sizes: "", status: "active",
  fabric: "", pattern: "", occasion: "", sareeLength: "", blousePiece: "",
  careInstructions: "", material: "", fit: "", workType: "", countryOfOrigin: "",
};

function ImageUploadField({ label, required, preview, onChange, onDelete, onMoveLeft, onMoveRight }) {
  const ref = useRef();
  return (
    <div className="admp-img-field" style={{ position: "relative" }}>
      <label className="adm-label">{label}{required && " *"}</label>
      <div className={`admp-img-zone${preview ? " admp-img-zone-filled" : ""}`} onClick={() => !preview && ref.current.click()}>
        {preview
          ? <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img src={preview} alt={label} className="admp-img-preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="admp-img-controls" style={{ position: "absolute", bottom: "5px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "12px", zIndex: 10 }} onClick={e => e.stopPropagation()}>
                {onMoveLeft && <button type="button" onClick={onMoveLeft} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>←</button>}
                <button type="button" onClick={onDelete} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" }}>✕</button>
                {onMoveRight && <button type="button" onClick={onMoveRight} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>→</button>}
              </div>
            </div>
          : <div className="admp-img-placeholder">
              <span className="admp-img-icon">⬆</span>
              <span className="admp-img-hint">Click to upload</span>
              <span className="admp-img-formats">JPG · PNG · WEBP</span>
            </div>
        }
      </div>
      <input ref={ref} type="file" accept={ACCEPTED} style={{ display: "none" }} onChange={onChange} />
    </div>
  );
}

function readFile(file) {
  return new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(file); });
}

// ── Super Admin: monitoring-only view ────────────────────────────────────────
function SuperAdminProductsView({ products }) {
  const [search, setSearch]         = useState("");
  const [filterStore, setFilterStore] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus]     = useState("All");
  const [sort, setSort]             = useState("newest");
  const [viewProduct, setViewProduct] = useState(null);

  // Collect unique store names from products
  const storeNames = useMemo(() => {
    const names = [...new Set(products.map(p => p.sellerId?.storeName || p.sellerId?.brandName || p.sellerName || "—"))];
    return names.filter(n => n && n !== "—");
  }, [products]);

  // Collect unique brand names from products
  const brandNames = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand || p.brandName || "—"))];
    return brands.filter(b => b && b !== "—");
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (filterStore !== "All") {
      list = list.filter(p => {
        const store = p.sellerId?.storeName || p.sellerId?.brandName || p.sellerName || "";
        return store === filterStore;
      });
    }
    if (filterBrand !== "All") {
      list = list.filter(p => (p.brand || p.brandName || "") === filterBrand);
    }
    if (filterCategory !== "All") list = list.filter(p => (p.category || "").toLowerCase() === filterCategory.toLowerCase());
    if (filterStatus !== "All")   list = list.filter(p => (p.status || "active") === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.name, p.brand, p.category].some(v => (v || "").toLowerCase().includes(q)));
    }
    if (sort === "most")  list.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
    if (sort === "least") list.sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
    if (sort === "high")  list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "low")   list.sort((a, b) => Number(a.price) - Number(b.price));
    return list;
  }, [products, filterStore, filterBrand, filterCategory, filterStatus, search, sort]);

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Products</h1>
          <p className="adm-page-sub">Platform-wide product monitoring — {products.length} total</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar adm-toolbar-wrap" style={{ flexWrap: "wrap", gap: "10px" }}>
          <input className="adm-search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adm-input adm-select-sm" value={filterStore} onChange={e => setFilterStore(e.target.value)}>
            <option value="All">All Stores</option>
            {storeNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select className="adm-input adm-select-sm" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
            <option value="All">All Brands</option>
            {brandNames.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="adm-input adm-select-sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select className="adm-input adm-select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="adm-input adm-select-sm" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="most">Highest Stock</option>
            <option value="least">Lowest Stock</option>
            <option value="high">Price: High to Low</option>
            <option value="low">Price: Low to High</option>
          </select>
          <span className="adm-count">{filtered.length} results</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Image</th><th>Product</th><th>Store</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.variants?.[0]?.images?.[0]?.url
                      ? <img src={p.variants[0].images[0].url} alt={p.name} className="adm-product-thumb" />
                      : <div className="admp-no-thumb">No img</div>
                    }
                  </td>
                  <td><span className="adm-product-name">{p.name}</span></td>
                  <td style={{ fontSize: "0.82rem", color: "#6B7280" }}>{p.sellerId?.storeName || p.sellerId?.brandName || p.sellerName || "—"}</td>
                  <td><span className="adm-badge-pill">{p.category}</span></td>
                  <td className="adm-amount">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td>
                    <span style={{
                      padding: "3px 8px", borderRadius: "12px", fontWeight: 600, fontSize: "0.8rem",
                      background: (p.stock || 0) < 5 ? "#FEE2E2" : "#D1FAE5",
                      color: (p.stock || 0) < 5 ? "#DC2626" : "#059669",
                    }}>{p.stock || 0} left</span>
                  </td>
                  <td>
                    <span className="adm-status-badge" style={{
                      background: (p.status || "active") === "active" ? "#D1FAE520" : "#FEE2E220",
                      color: STATUS_COLORS[p.status || "active"],
                    }}>{p.status || "active"}</span>
                  </td>
                  <td>
                    <button className="adm-action-btn adm-view" onClick={() => setViewProduct(p)}>View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="adm-empty">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {viewProduct && (
        <div className="adm-modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="adm-modal admp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{viewProduct.name}</h2>
              <button className="adm-modal-close" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="admp-view-grid">
              <div>
                {viewProduct.variants?.[0]?.images?.[0]?.url
                  ? <img src={viewProduct.variants[0].images[0].url} alt={viewProduct.name} className="admp-view-main-img" />
                  : <div className="admp-no-thumb admp-view-no-img">No image</div>
                }
                <div className="admp-view-gallery">
                  {(viewProduct.variants || []).flatMap(v => v.images || []).slice(1).filter(img => img && img.url).map((img, i) => (
                    <img key={i} src={img.url} alt="" className="admp-view-gallery-thumb" />
                  ))}
                </div>
              </div>
              <div>
                <div className="admp-view-meta">
                  <div className="admp-view-row"><span>Store</span><strong>{viewProduct.sellerId?.storeName || viewProduct.sellerName || "—"}</strong></div>
                  <div className="admp-view-row"><span>Brand</span><strong>{viewProduct.brand}</strong></div>
                  <div className="admp-view-row"><span>Category</span><strong>{viewProduct.category}</strong></div>
                  <div className="admp-view-row"><span>Price</span><strong>₹{Number(viewProduct.price).toLocaleString("en-IN")}</strong></div>
                  <div className="admp-view-row"><span>Stock</span><strong>{viewProduct.stock || 0}</strong></div>
                  <div className="admp-view-row"><span>Sizes</span><strong>{(viewProduct.sizes || []).join(", ") || "—"}</strong></div>
                  <div className="admp-view-row"><span>Variants</span><strong>{(viewProduct.variants || []).map(v => v.color).join(", ") || "—"}</strong></div>
                  <div className="admp-view-row"><span>Status</span><strong>{viewProduct.status}</strong></div>
                </div>
                {viewProduct.description && <p style={{ fontSize: "0.88rem", color: "#6c6c6c", marginTop: "16px", lineHeight: 1.7 }}>{viewProduct.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Store Admin: full CRUD ────────────────────────────────────────────────────
function StoreAdminProductsView({ products, addProduct, updateProduct, deleteProduct }) {
  const { user } = useAuth();
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formVariants, setFormVariants] = useState([
    { color: "", images: [{ name: "Front View", url: "" }] },
    { color: "", images: [{ name: "Front View", url: "" }] }
  ]);

  const [search, setSearch]       = useState("");
  const [deleteId, setDeleteId]   = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");

  const filtered = (products || []).filter(p => {
    const q = search.toLowerCase();
    return [p.name, p.brand, p.category].some(v => (v || "").toLowerCase().includes(q));
  });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addImageToVariant = (vIndex) => {
    setFormVariants(prev => {
      const copy = [...prev];
      copy[vIndex].images = [...copy[vIndex].images, { name: "", url: "" }];
      return copy;
    });
  };

  const removeImageFromVariant = (vIndex, imgIndex) => {
    setFormVariants(prev => {
      const copy = [...prev];
      const newImages = [...copy[vIndex].images];
      newImages.splice(imgIndex, 1);
      copy[vIndex].images = newImages;
      return copy;
    });
  };

  const handleImageNameChange = (vIndex, imgIndex, nameVal) => {
    setFormVariants(prev => {
      const copy = [...prev];
      copy[vIndex].images[imgIndex].name = nameVal;
      return copy;
    });
  };

  const handleImageFileChange = async (vIndex, imgIndex, file) => {
    if (!file) return;
    const dataUrl = await readFile(file);
    setFormVariants(prev => {
      const copy = [...prev];
      copy[vIndex].images[imgIndex].url = dataUrl;
      return copy;
    });
  };

  const handleVariantColorChange = (vIndex, colorVal) => {
    setFormVariants(prev => {
      const copy = [...prev];
      copy[vIndex].color = colorVal;
      return copy;
    });
  };

  const addExtraVariant = () => {
    setFormVariants(prev => [
      ...prev,
      { color: "", images: [{ name: "Front View", url: "" }] }
    ]);
  };

  const removeVariant = (vIndex) => {
    setFormVariants(prev => prev.filter((_, idx) => idx !== vIndex));
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, brand: user?.brandName || user?.storeName || "" });
    setFormVariants([
      { color: "", images: [{ name: "Front View", url: "" }] },
      { color: "", images: [{ name: "Front View", url: "" }] }
    ]);
    setEditId(null);
    setSaveError("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    const specs = p.specifications || {};
    setForm({
      name: p.name || "", brand: p.brand || "", category: p.category || "women",
      price: p.price || "", stock: p.stock || "", description: p.description || "",
      sizes: (p.sizes || []).join(", "), status: p.status || "active",
      fabric: specs.fabric || p.fabric || "",
      pattern: specs.pattern || p.pattern || "",
      occasion: specs.occasion || p.occasion || "",
      sareeLength: specs.sareeLength || p.sareeLength || "",
      blousePiece: specs.blousePiece || p.blousePiece || "",
      careInstructions: specs.careInstructions || p.careInstructions || "",
      material: specs.material || p.material || "",
      fit: specs.fit || p.fit || "",
      workType: specs.workType || p.workType || "",
      countryOfOrigin: specs.countryOfOrigin || p.countryOfOrigin || "",
    });

    if (p.variants && p.variants.length > 0) {
      setFormVariants(p.variants.map(v => ({
        color: v.color || "",
        images: (v.images && v.images.length > 0)
          ? v.images.map(img => ({
              name: typeof img === "object" ? (img.name || "Image") : "Image",
              url: typeof img === "object" ? (img.url || "") : (img || "")
            }))
          : [{ name: "Front View", url: "" }]
      })));
    } else {
      setFormVariants([
        { color: "", images: [{ name: "Front View", url: "" }] },
        { color: "", images: [{ name: "Front View", url: "" }] }
      ]);
    }

    setEditId(p._id);
    setSaveError("");
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const compiledVariants = formVariants
        .filter(v => v.color.trim())
        .map(v => ({
          color: v.color.trim(),
          images: v.images.filter(img => img.url.trim()).map(img => ({
            name: img.name.trim() || "Image",
            url: img.url.trim()
          }))
        }));

      const productData = {
        name: form.name, brand: form.brand, category: form.category,
        price: Number(form.price), stock: Number(form.stock) || 0,
        description: form.description, status: form.status,
        sizes:  form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        variants: compiledVariants,
        fabric: form.fabric,
        pattern: form.pattern,
        occasion: form.occasion,
        sareeLength: form.sareeLength,
        blousePiece: form.blousePiece,
        careInstructions: form.careInstructions,
        material: form.material,
        fit: form.fit,
        workType: form.workType,
        countryOfOrigin: form.countryOfOrigin
      };
      if (editId) await updateProduct(editId, productData);
      else await addProduct(productData);
      setShowForm(false);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try { await deleteProduct(deleteId); } catch {}
    setDeleteId(null);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Products</h1>
          <p className="adm-page-sub">{filtered.length} products</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="adm-count">{filtered.length} results</span>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Image</th><th>Product Name</th><th>Category</th><th>Brand</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.variants?.[0]?.images?.[0]?.url
                      ? <img src={p.variants[0].images[0].url} alt={p.name} className="adm-product-thumb" />
                      : <div className="admp-no-thumb">No img</div>
                    }
                  </td>
                  <td><span className="adm-product-name">{p.name}</span></td>
                  <td><span className="adm-badge-pill">{p.category}</span></td>
                  <td>{p.brand}</td>
                  <td className="adm-amount">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td>
                    <span style={{
                      padding: "3px 8px", borderRadius: "12px", fontWeight: 600, fontSize: "0.8rem",
                      background: (p.stock || 0) < 5 ? "#FEE2E2" : "#D1FAE5",
                      color: (p.stock || 0) < 5 ? "#DC2626" : "#059669",
                    }}>{p.stock || 0} left</span>
                  </td>
                  <td>
                    <span className="adm-status-badge" style={{
                      background: (p.status || "active") === "active" ? "#D1FAE520" : "#FEE2E220",
                      color: STATUS_COLORS[p.status || "active"],
                    }}>{p.status || "active"}</span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn adm-view" onClick={() => setViewProduct(p)}>View</button>
                      <button className="adm-action-btn adm-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteId(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="adm-empty">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal admp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editId ? "Edit Product" : "Add New Product"}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {saveError && <div className="adm-alert adm-alert-error" style={{ margin: "0 20px 12px" }}>{saveError}</div>}
            <form onSubmit={save}>
              <div className="admp-section-title">Basic Information</div>
              <div className="adm-form-grid">
                <div className="adm-form-group">
                  <label className="adm-label">Product Name *</label>
                  <input className="adm-input" name="name" value={form.name} onChange={handle} required />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Brand *</label>
                  <input className="adm-input" name="brand" value={form.brand} onChange={handle} required />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Category</label>
                  <select className="adm-input" name="category" value={form.category} onChange={handle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Price (₹) *</label>
                  <input className="adm-input" type="number" name="price" value={form.price} onChange={handle} required min="0" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Stock</label>
                  <input className="adm-input" type="number" name="stock" value={form.stock} onChange={handle} min="0" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Sizes (comma separated)</label>
                  <input className="adm-input" name="sizes" value={form.sizes} onChange={handle} placeholder="XS, S, M, L, XL" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Status</label>
                  <select className="adm-input" name="status" value={form.status} onChange={handle}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="adm-form-group adm-span-2">
                  <label className="adm-label">Description</label>
                  <textarea className="adm-input adm-textarea" name="description" value={form.description} onChange={handle} rows={2} />
                </div>
              </div>

              <div className="admp-section-title">Specifications (Ajio / Myntra Style)</div>
              <div className="adm-form-grid">
                <div className="adm-form-group"><label className="adm-label">Fabric</label><input className="adm-input" name="fabric" value={form.fabric} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Pattern</label><input className="adm-input" name="pattern" value={form.pattern} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Occasion</label><input className="adm-input" name="occasion" value={form.occasion} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Saree Length</label><input className="adm-input" name="sareeLength" value={form.sareeLength} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Blouse Piece</label><input className="adm-input" name="blousePiece" value={form.blousePiece} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Care Instructions</label><input className="adm-input" name="careInstructions" value={form.careInstructions} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Material</label><input className="adm-input" name="material" value={form.material} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Fit</label><input className="adm-input" name="fit" value={form.fit} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Work Type</label><input className="adm-input" name="workType" value={form.workType} onChange={handle} /></div>
                <div className="adm-form-group"><label className="adm-label">Country of Origin</label><input className="adm-input" name="countryOfOrigin" value={form.countryOfOrigin} onChange={handle} /></div>
              </div>

              <div className="admp-section-title">Variants (Color-specific image galleries)</div>
              {formVariants.map((variant, vIndex) => (
                <div key={vIndex} className="adm-card" style={{ padding: "16px", marginBottom: "16px", background: "#fcf9f9", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>Variant {vIndex + 1}</h4>
                    {formVariants.length > 2 && (
                      <button type="button" onClick={() => removeVariant(vIndex)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>
                        Remove Variant
                      </button>
                    )}
                  </div>
                  <div className="adm-form-group" style={{ marginBottom: "16px" }}>
                    <label className="adm-label">Color Name *</label>
                    <input className="adm-input" value={variant.color} onChange={e => handleVariantColorChange(vIndex, e.target.value)} placeholder="e.g. Violet, Black, Teal" required />
                  </div>
                  
                  <div className="admp-img-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    {variant.images.map((img, imgIndex) => (
                      <div key={imgIndex} style={{ border: "1px solid #e5e7eb", padding: "10px", borderRadius: "6px", background: "#fff", position: "relative" }}>
                        <div className="adm-form-group" style={{ marginBottom: "8px" }}>
                          <label className="adm-label" style={{ fontSize: "0.75rem" }}>Image Label</label>
                          <input className="adm-input" style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }} value={img.name} onChange={e => handleImageNameChange(vIndex, imgIndex, e.target.value)} placeholder="e.g. Front View, Detail" />
                        </div>
                        <ImageUploadField
                          label={`Image ${imgIndex + 1}`}
                          required={imgIndex === 0 && variant.color}
                          preview={img.url}
                          onChange={e => handleImageFileChange(vIndex, imgIndex, e.target.files[0])}
                          onDelete={() => removeImageFromVariant(vIndex, imgIndex)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: "12px" }}>
                    <button type="button" className="adm-btn adm-btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => addImageToVariant(vIndex)}>
                      + Add Extra Image
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: "24px" }}>
                <button type="button" className="adm-btn adm-btn-secondary" style={{ width: "100%", border: "1px dashed #cccccc" }} onClick={addExtraVariant}>
                  + Add Extra Variant
                </button>
              </div>

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewProduct && (
        <div className="adm-modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="adm-modal admp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{viewProduct.name}</h2>
              <button className="adm-modal-close" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="admp-view-grid">
              <div>
                {viewProduct.variants?.[0]?.images?.[0]?.url
                  ? <img src={viewProduct.variants[0].images[0].url} alt={viewProduct.name} className="admp-view-main-img" />
                  : <div className="admp-no-thumb admp-view-no-img">No image</div>
                }
                <div className="admp-view-gallery">
                  {(viewProduct.variants || []).flatMap(v => v.images || []).slice(1).filter(img => img && img.url).map((img, i) => (
                    <img key={i} src={img.url} alt="" className="admp-view-gallery-thumb" />
                  ))}
                </div>
              </div>
              <div>
                <div className="admp-view-meta">
                  <div className="admp-view-row"><span>Brand</span><strong>{viewProduct.brand}</strong></div>
                  <div className="admp-view-row"><span>Category</span><strong>{viewProduct.category}</strong></div>
                  <div className="admp-view-row"><span>Price</span><strong>₹{Number(viewProduct.price).toLocaleString("en-IN")}</strong></div>
                  <div className="admp-view-row"><span>Stock</span><strong>{viewProduct.stock || 0}</strong></div>
                  <div className="admp-view-row"><span>Sizes</span><strong>{(viewProduct.sizes || []).join(", ") || "—"}</strong></div>
                  <div className="admp-view-row"><span>Variants</span><strong>{(viewProduct.variants || []).map(v => v.color).join(", ") || "—"}</strong></div>
                  <div className="admp-view-row"><span>Status</span><strong>{viewProduct.status}</strong></div>
                </div>
                {viewProduct.description && <p style={{ fontSize: "0.88rem", color: "#6c6c6c", marginTop: "16px", lineHeight: 1.7 }}>{viewProduct.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">Delete Product?</h3>
            <p className="adm-confirm-text">This action cannot be undone.</p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, isSuperAdmin } = useAdmin();
  
  // Custom view transformation to support variants for Super Admin list if necessary
  if (isSuperAdmin) return <SuperAdminProductsView products={products} />;
  return <StoreAdminProductsView products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} />;
}
