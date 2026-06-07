import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../Components/ProductCard";
import "../Assets/Css/products.css";

const CATEGORIES = ["All", "women", "men", "kids", "ethnic"];
const CAT_LABELS  = { All: "All", women: "Women", men: "Men", kids: "Kids", ethnic: "Ethnic Wear" };

export default function Products() {
  const { products, productsLoading, fetchProducts } = useStore();
  const [searchParams] = useSearchParams();
  const initCat   = searchParams.get("category") || "All";
  const initBrand = searchParams.get("brand") || "";

  const [search, setSearch]     = useState(initBrand);
  const [debouncedSearch, setDebouncedSearch] = useState(initBrand);
  const [category, setCategory] = useState(CATEGORIES.includes(initCat) ? initCat : "All");
  const [sort, setSort]         = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Sync if URL params change
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    setCategory(CATEGORIES.includes(cat) ? cat : "All");
    const brand = searchParams.get("brand") || "";
    if (brand) {
      setSearch(brand);
      setDebouncedSearch(brand);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch products from server when query parameters change
  useEffect(() => {
    fetchProducts({
      search: debouncedSearch,
      category: category === "All" ? "" : category,
      sort,
      minPrice,
      maxPrice,
    });
  }, [debouncedSearch, category, sort, minPrice, maxPrice, fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, debouncedSearch, sort, minPrice, maxPrice]);

  const filtered = products;

  // Derive unique brands from current products for display
  const brandList = useMemo(() => {
    return [...new Set(products.map(p => p.brand || p.sellerName || "").filter(Boolean))].sort();
  }, [products]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const clearFilters = () => {
    setCategory("All");
    setSearch("");
    setDebouncedSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="catalog-layout" style={{ paddingTop: "30px" }}>
            <aside className="filters-sidebar">
              <div className="filter-header-main">
                <h3 className="filter-title-main">Filters</h3>
                <button className="btn-clear-filters" onClick={clearFilters}>Clear All</button>
              </div>

              <div className="filter-group">
                <p className="filter-title">Search</p>
                <div className="hero-search-wrapper" style={{ marginBottom: 0 }}>
                  <input type="text" placeholder="Search name, brand, store..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>

              <div className="filter-group">
                <p className="filter-title">Category</p>
                <div className="filter-options">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="filter-label">
                      <input type="radio" name="category" checked={category === cat} onChange={() => setCategory(cat)} />
                      {CAT_LABELS[cat]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <p className="filter-title">Price Range</p>
                <div className="price-range-inputs">
                  <input
                    type="number" placeholder="Min ₹" value={minPrice} min="0"
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number" placeholder="Max ₹" value={maxPrice} min="0"
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {brandList.length > 0 && (
                <div className="filter-group">
                  <p className="filter-title">Suggested Brands</p>
                  <div className="filter-options">
                    {brandList.slice(0, 8).map(brand => (
                      <label key={brand} className="filter-label">
                        <input type="checkbox"
                          checked={search === brand}
                          onChange={e => setSearch(e.target.checked ? brand : "")}
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div className="catalog-content">
              <div className="catalog-toolbar">
                <span className="catalog-count">{productsLoading ? "Loading..." : `${filtered.length} products found`}</span>
                <div className="catalog-sorting">
                  <label>Sort by:</label>
                  <select className="catalog-select-sort" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="popularity">Popularity (Most Reviewed)</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Best Rated</option>
                  </select>
                </div>
              </div>

              {productsLoading ? (
                <div className="no-results"><p>Loading products...</p></div>
              ) : (
                <>
                  <div className="catalog-products-grid">
                    {paginatedProducts.length === 0 ? (
                      <div className="no-results">
                        <h4>No products found</h4>
                        <p>Try adjusting your filters or search term.</p>
                        <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
                      </div>
                    ) : (
                      paginatedProducts.map(p => <ProductCard key={p._id} product={p} />)
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-wrapper" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "30px" }}>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          className={`btn-pagination${currentPage === i + 1 ? " pagination-active" : ""}`}
                          onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          style={{
                            padding: "8px 14px", border: "1px solid #e9d5d6", borderRadius: "8px",
                            background: currentPage === i + 1 ? "#2f2f2f" : "#ffffff",
                            color: currentPage === i + 1 ? "#ffffff" : "#2f2f2f",
                            cursor: "pointer", fontWeight: 600
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
