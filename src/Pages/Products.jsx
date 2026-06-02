import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../Components/ProductCard";
import "../Assets/Css/products.css";

const CATEGORIES = ["All", "Women", "Men", "Kids", "Ethnic Wear"];

export default function Products() {
  const { products } = useStore();
  const [searchParams] = useSearchParams();
  const initCat = searchParams.get("category") === "ethnic" ? "Ethnic Wear" : "All";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initCat);
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "All") {
      const map = { "Women": "women", "Men": "men", "Kids": "kids", "Ethnic Wear": "ethnic" };
      list = list.filter(p => p.category === map[category]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    else if (sort === "high") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [products, category, search, sort]);

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="catalog-layout" style={{ paddingTop: "30px" }}>
            <aside className="filters-sidebar">
              <div className="filter-header-main">
                <h3 className="filter-title-main">Filters</h3>
                <button className="btn-clear-filters" onClick={() => { setCategory("All"); setSearch(""); }}>Clear All</button>
              </div>
              <div className="filter-group">
                <p className="filter-title">Search</p>
                <div className="hero-search-wrapper" style={{ marginBottom: 0 }}>
                  <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="filter-group">
                <p className="filter-title">Category</p>
                <div className="filter-options">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="filter-label">
                      <input type="radio" name="category" checked={category === cat} onChange={() => setCategory(cat)} />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="catalog-content">
              <div className="catalog-toolbar">
                <span className="catalog-count">{filtered.length} products found</span>
                <div className="catalog-sorting">
                  <label>Sort by:</label>
                  <select className="catalog-select-sort" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="catalog-products-grid">
                {filtered.length === 0 ? (
                  <div className="no-results">
                    <h4>No products found</h4>
                    <p>Try adjusting your filters or search term.</p>
                    <button className="btn-primary" onClick={() => { setCategory("All"); setSearch(""); }}>Clear Filters</button>
                  </div>
                ) : (
                  filtered.map(p => <ProductCard key={p.id} product={p} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
