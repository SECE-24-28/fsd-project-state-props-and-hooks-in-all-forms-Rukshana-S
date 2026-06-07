# Project Documentation: WEARLY Multi-Vendor E-Commerce Platform

---

## 1. Abstract
WEARLY is a highly optimized, production-ready multi-vendor fashion e-commerce marketplace. The system bridges independent designer boutiques and retail clothing vendors directly with consumers through a unified, secure portal. Featuring distinct panels for Customers, Store Admins, and Super Admins, the platform integrates real-world services like the Razorpay sandbox payment gateway, Cloudinary image storage API, automated Nodemailer transaction alerts, coupon discount systems, customer review threads, and advanced analytical dashboard visualizations.

---

## 2. Problem Statement
Traditional single-vendor e-commerce platforms restrict the choice of clothing styles and force independent, local boutiques to build and maintain expensive personal websites. Existing marketplaces frequently suffer from high latency during catalog searching, lack granular security permissions for store owners, and offer generic, unoptimized analytical data. WEARLY solves these problems by providing a unified, secure multi-tenant marketplace where vendors can manage their stock separately and view dedicated performance metrics, while customers enjoy high-performance searching, reviews, and secure payments.

---

## 3. Objectives
- **Multi-Tenant Isolation**: Enable store admins to only manage and view analytical statistics for their own products.
- **Payment Security**: Integrate third-party payments (Razorpay Sandbox) with strict backend cryptographic signature verification (HMAC-SHA256).
- **Interactive Visuals**: Render charts for customer acquisition and category distributions using Recharts on the frontend.
- **Robust Security**: Implement secure headers via Helmet, query limits via Express-Rate-Limit, dynamic CORS rules, and a centralized error handling system.
- **SEO & PWA Optimization**: Configure Open Graph metadata, title tags, responsive structures, service workers for asset caching, and standalone install manifests.

---

## 4. Architecture Diagram
The system is built on a standard Three-Tier Client-Server-Database Architecture:

```
+---------------------------------------+
|              React Client             |
|  (State Contexts, Axios, Recharts,    |
|   Razorpay SDK, Service Workers)      |
+-------------------+-------------------+
                    | HTTPS Requests
                    v
+-------------------+-------------------+
|            Express Server             |
|   (Helmet Security, Rate-Limiters,    |
|    JWT Guards, Nodemailer, Cloudinary)|
+-------------------+-------------------+
                    | Mongoose ODM
                    v
+-------------------+-------------------+
|         MongoDB Atlas Cluster         |
|   (Users, Products, Orders, Reviews,  |
|    Coupons, Carts, Wishlists)         |
+---------------------------------------+
```

---

## 5. Entity Relationship (ER) Diagram
The database relationships mapped via Mongoose:

```
[User] (role: user, store-admin, super-admin)
  |
  +--1:N--> [Cart] (products array)
  |
  +--1:N--> [Wishlist] (products array)
  |
  +--1:N--> [Product] (sellerId references User)
  |           |
  |           +--1:N--> [Review] (productId references Product)
  |
  +--1:N--> [Order] (userId references User, products array)
```

---

## 6. Sequence Diagram: Online Checkout Payment Flow
Steps involved during a secure Razorpay checkout:

```
Customer              Checkout Page            Express Backend          Razorpay API
   |                        |                        |                        |
   |-- Click Place Order -->|                        |                        |
   |                        |-- Create Payment Order |                        |
   |                        |   (Amount in grand) -->|                        |
   |                        |                        |-- Post Order Request ->|
   |                        |                        |<-- Return Order ID ----|
   |                        |<-- Return Order ID ----|                        |
   |                        |                                                 |
   |                        |-- Launch Razorpay SDK Popup ------------------->|
   |                        |<-- Complete Card/UPI Sandbox Payment -----------|
   |                        |                                                 |
   |                        |-- POST verify --------------------------------->|
   |                        |   (signature, paymentId, orderDetails)          |
   |                        |                        |-- Calculate HMAC ------|
   |                        |                        |-- Compare signatures---|
   |                        |                        |-- Save Order to Atlas -|
   |                        |                        |-- Decrement Stock -----|
   |                        |                        |-- Send Nodemailer email|
   |                        |<-- Return Success -----|                        |
   |<-- Order Success ------|                                                 |
```

---

## 7. Technology Stack
- **Frontend**: HTML5, Vanilla CSS3, JavaScript, React v19, React Router v7, Recharts, Axios
- **Backend**: Node.js, Express v4, JWT, Nodemailer, Cloudinary Node SDK, Razorpay Node SDK
- **Database**: MongoDB Atlas, Mongoose
- **Security**: Helmet, Express-Rate-Limit, CORS, BcryptJS

---

## 8. Testing & Validation Results
All operational pipelines were verified locally:
1. **User flow**: Registration sends welcome email. Login generates token successfully stored in client.
2. **Catalog search**: Search input debounces at 400ms. MongoDB returns filtered category and sorted items.
3. **Cart & Wishlist**: Quantities update accurately. Adding to cart checks database stock levels.
4. **Checkout & Razorpay**: Razorpay popup completes sandbox transaction; verification middleware checks HMAC signature, saves order, decrements stock, and triggers confirmation emails.
5. **Coupons**: Percentage and fixed coupons calculate discounts, subtract from grand total, and enforce minimum order value rules.
6. **Analytics**: Aggregations fetch statistics and render growth graphs.

---

## 9. Conclusion & Future Scope
WEARLY provides a highly secure, performant, and premium shopping marketplace. Future scope includes:
- Integrating elastic search indexation for faster matches across millions of products.
- Setting up a multi-region database cluster to reduce geographical latency.
- Developing automated merchant invoice generation and payouts.
