import React, { useState, useRef } from "react";
import "../styles/AdminProducts.css";
import { useAdmin } from "../context/AdminContext";

const STATUS_COLORS = { active: "#059669", inactive: "#DC2626" };
const CATEGORIES = ["women", "men", "kids", "ethnic"];
const ACCEPTED = "image/jpg,image/jpeg,image/png,image/webp";

const EMPTY_FORM = {
  name: "", brand: "", category: "women",
  price: "", stock: "", description: "", sizes: "", status: "active",
};
const EMPTY_VARIANT = { color: "", images: [], previews: [] };

function ImageUploadField({ label, required, preview, onChange }) {
  const ref = useRef();
  return (
    <div className="admp-img-field">
      <label className="adm-label">{label}{required && " *"}</label>
      <div
        className={`admp-img-zone${preview ? " admp-img-zone-filled" : ""}`}
        onClick={() => ref.current.click()}
      >
        {preview ? (
          <img src={preview} alt={label} className="admp-img-preview" />
        ) : (
          <div className="admp-img-placeholder">
            <span className="admp-img-icon">⬆</span>
            <span className="admp-img-hint">Click to upload</span>
            <span className="admp-img-formats">JPG · PNG · WEBP</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept={ACCEPTED} style={{ display: "none" }} onChange={onChange} />
    </div>
  );
}

function readFile(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState(["", "", "", "", ""]);
  const [imagePreviews, setImagePreviews] = useState(["", "", "", "", ""]);
  const [colorVariants, setColorVariants] = useState([{ ...EMPTY_VARIANT }]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const filtered = products.filter(p =>
    [p.name, p.brand, p.category].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setImages(prev => { const n = [...prev]; n[index] = dataUrl; return n; });
    setImagePreviews(prev => { const n = [...prev]; n[index] = dataUrl; return n; });
  };

  const handleVariantColorChange = (i, value) => {
    setColorVariants(prev => prev.map((v, idx) => idx === i ? { ...v, color: value } : v));
  };

  const handleVariantImageUpload = async (variantIdx, imgIdx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setColorVariants(prev => prev.map((v, i) => {
      if (i !== variantIdx) return v;
      const imgs = [...(v.images || [])];
      const prevs = [...(v.previews || [])];
      imgs[imgIdx] = dataUrl;
      prevs[imgIdx] = dataUrl;
      return { ...v, images: imgs, previews: prevs };
    }));
  };

  const addVariant = () => setColorVariants(prev => [...prev, { ...EMPTY_VARIANT, images: [], previews: [] }]);
  const removeVariant = (i) => setColorVariants(prev => prev.filter((_, idx) => idx !== i));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImages(["", "", "", "", ""]);
    setImagePreviews(["", "", "", "", ""]);
    setColorVariants([{ ...EMPTY_VARIANT, images: [], previews: [] }]);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, brand: p.brand || "", category: p.category,
      price: p.price, stock: p.stock || "", description: p.description || "",
      sizes: (p.sizes || []).join(", "), status: p.status || "active",
    });
    const existImgs = p.images || [];
    const imgs = Array(5).fill("").map((_, i) => existImgs[i] || "");
    setImages(imgs);
    setImagePreviews(imgs);
    setColorVariants(
      (p.colorVariants || []).length > 0
        ? p.colorVariants.map(cv => ({ color: cv.color, images: cv.images || [], previews: cv.images || [] }))
        : [{ ...EMPTY_VARIANT, images: [], previews: [] }]
    );
    setEditId(p.id);
    setShowForm(true);
  };

  const save = (e) => {
    e.preventDefault();
    const finalImages = images.filter(Boolean);
    const finalVariants = colorVariants
      .filter(v => v.color.trim())
      .map(v => ({ color: v.color, images: v.images.filter(Boolean) }));

    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      images: finalImages,
      image: finalImages[0] || "",
      colorVariants: finalVariants,
      rating: 4.5,
      isNew: !editId,
      oldPrice: editId ? undefined : Number(form.price) * 1.3,
    };

    if (editId) updateProduct(editId, productData);
    else addProduct(productData);
    setShowForm(false);
  };

  const confirmDelete = () => { deleteProduct(deleteId); setDeleteId(null); };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Products</h1>
          <p className="adm-page-sub">{products.length} total products</p>
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
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Images</th>
                <th>Colors</th>
                <th>Sizes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image || (p.images && p.images[0]) ? (
                      <img src={p.image || p.images[0]} alt={p.name} className="adm-product-thumb" />
                    ) : (
                      <div className="admp-no-thumb">No img</div>
                    )}
                  </td>
                  <td><span className="adm-product-name">{p.name}</span></td>
                  <td><span className="adm-badge-pill">{p.category}</span></td>
                  <td>{p.brand}</td>
                  <td className="adm-amount">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td>
                    <span className="admp-count-badge">{(p.images || []).filter(Boolean).length} imgs</span>
                  </td>
                  <td>
                    <div className="admp-color-dots">
                      {(p.colorVariants || []).slice(0, 4).map((cv, i) => (
                        <span key={i} className="admp-color-tag" title={cv.color}>{cv.color}</span>
                      ))}
                      {(p.colorVariants || []).length === 0 && <span className="adm-text-muted">—</span>}
                    </div>
                  </td>
                  <td><span className="adm-sizes">{(p.sizes || []).join(", ") || "—"}</span></td>
                  <td>
                    <span className="adm-status-badge" style={{
                      background: (p.status || "active") === "active" ? "#D1FAE520" : "#FEE2E220",
                      color: (p.status || "active") === "active" ? STATUS_COLORS.active : STATUS_COLORS.inactive
                    }}>
                      {p.status || "active"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn adm-view" onClick={() => setViewProduct(p)}>View</button>
                      <button className="adm-action-btn adm-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteId(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="adm-empty">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal admp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editId ? "Edit Product" : "Add New Product"}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              {/* Basic Info */}
              <div className="admp-section-title">Basic Information</div>
              <div className="adm-form-grid">
                <div className="adm-form-group">
                  <label className="adm-label">Product Name *</label>
                  <input className="adm-input" name="name" value={form.name} onChange={handle} required placeholder="e.g. Floral Embroidered Kurta" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Brand *</label>
                  <input className="adm-input" name="brand" value={form.brand} onChange={handle} required placeholder="e.g. WEARLY" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Category</label>
                  <select className="adm-input" name="category" value={form.category} onChange={handle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Price (₹) *</label>
                  <input className="adm-input" type="number" name="price" value={form.price} onChange={handle} required min="0" placeholder="1299" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Stock</label>
                  <input className="adm-input" type="number" name="stock" value={form.stock} onChange={handle} min="0" placeholder="50" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Sizes</label>
                  <input className="adm-input" name="sizes" value={form.sizes} onChange={handle} placeholder="XS, S, M, L, XL, XXL" />
                </div>
                <div className="adm-form-group adm-span-2">
                  <label className="adm-label">Description</label>
                  <textarea className="adm-input adm-textarea" name="description" value={form.description} onChange={handle} rows={3} placeholder="Product description..." />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Status</label>
                  <select className="adm-input" name="status" value={form.status} onChange={handle}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Product Images */}
              <div className="admp-section-title">Product Images</div>
              <div className="admp-img-grid">
                {[
                  "Main Product Image",
                  "Gallery Image 1",
                  "Gallery Image 2",
                  "Gallery Image 3",
                  "Gallery Image 4",
                ].map((label, i) => (
                  <ImageUploadField
                    key={i}
                    label={label}
                    required={i === 0}
                    preview={imagePreviews[i]}
                    onChange={e => handleImageUpload(i, e)}
                  />
                ))}
              </div>

              {/* Color Variants */}
              <div className="admp-section-title">
                Color Variants
                <button type="button" className="admp-add-variant-btn" onClick={addVariant}>+ Add Color</button>
              </div>

              {colorVariants.map((variant, vi) => (
                <div key={vi} className="admp-variant-block">
                  <div className="admp-variant-header">
                    <div className="adm-form-group admp-variant-color-field">
                      <label className="adm-label">Color Name</label>
                      <input
                        className="adm-input"
                        value={variant.color}
                        onChange={e => handleVariantColorChange(vi, e.target.value)}
                        placeholder="e.g. Black, Cream, Rose Pink"
                      />
                    </div>
                    {colorVariants.length > 1 && (
                      <button type="button" className="admp-remove-variant" onClick={() => removeVariant(vi)}>✕</button>
                    )}
                  </div>
                  <div className="admp-variant-imgs">
                    {[0, 1, 2].map(ii => (
                      <ImageUploadField
                        key={ii}
                        label={`Variant Image ${ii + 1}`}
                        preview={variant.previews?.[ii] || ""}
                        onChange={e => handleVariantImageUpload(vi, ii, e)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">{editId ? "Update Product" : "Save Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewProduct && (
        <div className="adm-modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="adm-modal admp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{viewProduct.name}</h2>
              <button className="adm-modal-close" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="admp-view-grid">
              <div>
                {viewProduct.image || (viewProduct.images || [])[0] ? (
                  <img src={viewProduct.image || viewProduct.images[0]} alt={viewProduct.name} className="admp-view-main-img" />
                ) : (
                  <div className="admp-no-thumb admp-view-no-img">No image</div>
                )}
                {(viewProduct.images || []).length > 1 && (
                  <div className="admp-view-gallery">
                    {viewProduct.images.filter(Boolean).map((img, i) => (
                      <img key={i} src={img} alt={`img-${i}`} className="admp-view-gallery-thumb" />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="admp-view-meta">
                  <div className="admp-view-row"><span>Brand</span><strong>{viewProduct.brand}</strong></div>
                  <div className="admp-view-row"><span>Category</span><strong>{viewProduct.category}</strong></div>
                  <div className="admp-view-row"><span>Price</span><strong>₹{Number(viewProduct.price).toLocaleString("en-IN")}</strong></div>
                  <div className="admp-view-row"><span>Stock</span><strong>{viewProduct.stock || 0}</strong></div>
                  <div className="admp-view-row"><span>Sizes</span><strong>{(viewProduct.sizes || []).join(", ") || "—"}</strong></div>
                  <div className="admp-view-row"><span>Status</span><strong>{viewProduct.status || "active"}</strong></div>
                </div>
                {(viewProduct.colorVariants || []).length > 0 && (
                  <div className="admp-view-variants">
                    <div className="admp-section-title" style={{ marginTop: 16 }}>Color Variants</div>
                    {viewProduct.colorVariants.map((cv, i) => (
                      <div key={i} className="admp-view-variant-row">
                        <span className="admp-color-tag">{cv.color}</span>
                        <div className="admp-view-variant-imgs">
                          {(cv.images || []).filter(Boolean).map((img, j) => (
                            <img key={j} src={img} alt={`${cv.color}-${j}`} className="admp-view-gallery-thumb" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {viewProduct.description && (
                  <div className="admp-view-desc">
                    <div className="admp-section-title" style={{ marginTop: 16 }}>Description</div>
                    <p>{viewProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
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
