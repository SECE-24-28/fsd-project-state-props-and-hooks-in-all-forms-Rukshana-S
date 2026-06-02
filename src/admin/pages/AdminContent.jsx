import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";

const TABS = ["Hero", "Top Trends", "Brands", "Ethnic Wear", "FAQ"];

const INIT_TRENDS = [
  { id: 1, title: "Pastel Tees", category: "Women", discount: "50% OFF" },
  { id: 2, title: "Linen Shirts", category: "Men", discount: "40% OFF" },
  { id: 3, title: "Frocks & Sets", category: "Kids", discount: "45% OFF" },
  { id: 4, title: "Street Style", category: "All", discount: "35% OFF" },
];
const INIT_BRANDS = [
  { id: 1, name: "Yousta", desc: "Youthful pastel essentials" },
  { id: 2, name: "Azorte", desc: "Contemporary luxury wear" },
  { id: 3, name: "Biba", desc: "Timeless ethnic elegance" },
  { id: 4, name: "Manyavar", desc: "Festive & bridal couture" },
];
const INIT_ETHNIC = [
  { id: 1, title: "Silk Sarees", category: "Ethnic", discount: "60% OFF" },
  { id: 2, title: "Kurta Sets", category: "Ethnic", discount: "50% OFF" },
  { id: 3, title: "Lehenga Choli", category: "Ethnic", discount: "55% OFF" },
  { id: 4, title: "Anarkali Suits", category: "Ethnic", discount: "45% OFF" },
];

export default function AdminContent() {
  const { faq, addFaq, updateFaq, deleteFaq } = useAdmin();
  const [tab, setTab] = useState("Hero");

  const [hero, setHero] = useState({ title: "Change Your Wardrobe.\nFind Exciting Styles.", subtitle: "WEARLY Luxury Edit", btnText: "Explore Collection" });
  const [trends, setTrends] = useState(INIT_TRENDS);
  const [brands, setBrands] = useState(INIT_BRANDS);
  const [ethnic, setEthnic] = useState(INIT_ETHNIC);

  const [editFaq, setEditFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [showFaqForm, setShowFaqForm] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [itemForm, setItemForm] = useState({});
  const [itemTarget, setItemTarget] = useState(null);
  const [deleteInfo, setDeleteInfo] = useState(null);

  const openItemEdit = (item, target) => { setItemForm({ ...item }); setEditItem(item.id); setItemTarget(target); };
  const openItemAdd = (target) => { setItemForm({ title: "", category: "", discount: "", name: "", desc: "" }); setEditItem(null); setItemTarget(target); };

  const saveItem = () => {
    const setter = itemTarget === "trends" ? setTrends : itemTarget === "brands" ? setBrands : setEthnic;
    if (editItem) {
      setter(prev => prev.map(i => i.id === editItem ? { ...i, ...itemForm } : i));
    } else {
      setter(prev => [...prev, { ...itemForm, id: Date.now() }]);
    }
    setItemTarget(null); setEditItem(null);
  };

  const deleteItem = () => {
    const { target, id } = deleteInfo;
    const setter = target === "trends" ? setTrends : target === "brands" ? setBrands : setEthnic;
    setter(prev => prev.filter(i => i.id !== id));
    setDeleteInfo(null);
  };

  const openFaqAdd = () => { setFaqForm({ question: "", answer: "" }); setEditFaq(null); setShowFaqForm(true); };
  const openFaqEdit = (f) => { setFaqForm({ question: f.question, answer: f.answer }); setEditFaq(f.id); setShowFaqForm(true); };
  const saveFaq = () => {
    if (!faqForm.question || !faqForm.answer) return;
    if (editFaq) updateFaq(editFaq, faqForm);
    else addFaq(faqForm);
    setShowFaqForm(false);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Content Management</h1>
          <p className="adm-page-sub">Manage homepage sections, FAQ and more</p>
        </div>
      </div>

      <div className="adm-tabs">
        {TABS.map(t => (
          <button key={t} className={`adm-tab${tab === t ? " adm-tab-active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Hero */}
      {tab === "Hero" && (
        <div className="adm-card">
          <h3 className="adm-card-title">Hero Section</h3>
          <div className="adm-form-grid">
            <div className="adm-form-group adm-span-2">
              <label className="adm-label">Hero Title</label>
              <textarea className="adm-input adm-textarea" value={hero.title} onChange={e => setHero(h => ({ ...h, title: e.target.value }))} rows={2} />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Subtitle</label>
              <input className="adm-input" value={hero.subtitle} onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))} />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Button Text</label>
              <input className="adm-input" value={hero.btnText} onChange={e => setHero(h => ({ ...h, btnText: e.target.value }))} />
            </div>
          </div>
          <button className="adm-btn adm-btn-primary" style={{ marginTop: 16 }}>Save Hero</button>
        </div>
      )}

      {/* Top Trends */}
      {tab === "Top Trends" && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Top Trends</h3>
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => openItemAdd("trends")}>＋ Add</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Title</th><th>Category</th><th>Discount</th><th>Actions</th></tr></thead>
              <tbody>
                {trends.map(t => (
                  <tr key={t.id}>
                    <td>{t.title}</td><td>{t.category}</td><td>{t.discount}</td>
                    <td><div className="adm-actions">
                      <button className="adm-action-btn adm-edit" onClick={() => openItemEdit(t, "trends")}>Edit</button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteInfo({ target: "trends", id: t.id })}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brands */}
      {tab === "Brands" && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Brands</h3>
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => openItemAdd("brands")}>＋ Add</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Brand Name</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.name}</strong></td><td>{b.desc}</td>
                    <td><div className="adm-actions">
                      <button className="adm-action-btn adm-edit" onClick={() => openItemEdit(b, "brands")}>Edit</button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteInfo({ target: "brands", id: b.id })}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ethnic */}
      {tab === "Ethnic Wear" && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Ethnic Wear</h3>
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => openItemAdd("ethnic")}>＋ Add</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Title</th><th>Category</th><th>Discount</th><th>Actions</th></tr></thead>
              <tbody>
                {ethnic.map(e => (
                  <tr key={e.id}>
                    <td>{e.title}</td><td>{e.category}</td><td>{e.discount}</td>
                    <td><div className="adm-actions">
                      <button className="adm-action-btn adm-edit" onClick={() => openItemEdit(e, "ethnic")}>Edit</button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteInfo({ target: "ethnic", id: e.id })}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ */}
      {tab === "FAQ" && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">FAQ Management</h3>
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={openFaqAdd}>＋ Add FAQ</button>
          </div>
          <div className="adm-faq-list">
            {faq.map(f => (
              <div key={f.id} className="adm-faq-item">
                <div className="adm-faq-q"><strong>Q:</strong> {f.question}</div>
                <div className="adm-faq-a"><strong>A:</strong> {f.answer}</div>
                <div className="adm-actions" style={{ marginTop: 8 }}>
                  <button className="adm-action-btn adm-edit" onClick={() => openFaqEdit(f)}>Edit</button>
                  <button className="adm-action-btn adm-delete" onClick={() => deleteFaq(f.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Edit Modal */}
      {itemTarget && (
        <div className="adm-modal-overlay" onClick={() => setItemTarget(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editItem ? "Edit" : "Add"} Item</h2>
              <button className="adm-modal-close" onClick={() => setItemTarget(null)}>✕</button>
            </div>
            <div className="adm-modal-form">
              {itemTarget === "brands" ? (
                <>
                  <div className="adm-form-group"><label className="adm-label">Brand Name</label><input className="adm-input" value={itemForm.name || ""} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="adm-form-group"><label className="adm-label">Description</label><input className="adm-input" value={itemForm.desc || ""} onChange={e => setItemForm(f => ({ ...f, desc: e.target.value }))} /></div>
                </>
              ) : (
                <>
                  <div className="adm-form-group"><label className="adm-label">Title</label><input className="adm-input" value={itemForm.title || ""} onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div className="adm-form-group"><label className="adm-label">Category</label><input className="adm-input" value={itemForm.category || ""} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))} /></div>
                  <div className="adm-form-group"><label className="adm-label">Discount</label><input className="adm-input" value={itemForm.discount || ""} onChange={e => setItemForm(f => ({ ...f, discount: e.target.value }))} /></div>
                </>
              )}
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setItemTarget(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveItem}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Form Modal */}
      {showFaqForm && (
        <div className="adm-modal-overlay" onClick={() => setShowFaqForm(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editFaq ? "Edit FAQ" : "Add FAQ"}</h2>
              <button className="adm-modal-close" onClick={() => setShowFaqForm(false)}>✕</button>
            </div>
            <div className="adm-modal-form">
              <div className="adm-form-group"><label className="adm-label">Question</label><input className="adm-input" value={faqForm.question} onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))} /></div>
              <div className="adm-form-group"><label className="adm-label">Answer</label><textarea className="adm-input adm-textarea" rows={3} value={faqForm.answer} onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))} /></div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setShowFaqForm(false)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveFaq}>Save FAQ</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteInfo && (
        <div className="adm-modal-overlay" onClick={() => setDeleteInfo(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">Delete item?</h3>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteInfo(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={deleteItem}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
