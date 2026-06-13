<div align="center">
  <h1>✨ WEARLY</h1>
  <p><strong>A Premium Multi-Vendor Fashion & Clothing Marketplace</strong></p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
</div>

<br />

WEARLY is a state-of-the-art, fully responsive multi-vendor e-commerce platform designed to bring independent clothing merchants and luxury design boutiques together under one premium storefront.

Modeled after industry-leading platforms like Myntra, Shopify, and SSENSE, WEARLY is built on the **MERN** stack and features role-based access control, secure Razorpay payments, real-time email notifications, Cloudinary image hosting, interactive reviews, and complex data-aggregation sales dashboards.

---

## 🌟 Key Features

### 🛍 Customer Experience
- **Luxury Responsive UI**: A meticulously crafted pink/white luxury aesthetic featuring CSS Grid layouts that flawlessly scale from desktop to tablet to mobile.
- **Interactive Catalog & Filters**: Search by name, brand, store, or category with instant debounced queries. Advanced sorting options include Newest, Popularity, Price Asc/Desc, and Best Rated.
- **Dynamic Cart & Wishlist**: Real-time state management using React Context. Features elegant increment/decrement quantity controllers, size/color selections, and stock restriction safeguards.
- **Coupons & Offers**: Intelligent checkout system supporting flat and percentage-based discounts.
- **Secure Payment Gateway**: End-to-end sandbox payment integration using the Razorpay Node SDK with secure backend HMAC-SHA256 signature verification.
- **Order Tracking**: Beautiful timeline tracker visualizing order status stages (`Pending`, `Processing`, `Shipped`, `Delivered`).
- **Product Reviews & Ratings**: Customers can leave 1-5 star ratings and comments, instantly reflected in dynamic pre-aggregated product scores.

### 🏪 Store Admin Dashboard (Vendors)
- **Inventory Manager**: Full CRUD capabilities for products. Supports up to 5 images per product (via Cloudinary), custom sizes, and colors.
- **Sales Analytics**: Deep insights generated via MongoDB aggregation pipelines. Vendors can securely view their own revenues, total orders, and customer segments.
- **Data Export**: Export catalog lists, customer details, and order history directly to CSV format for external accounting.

### 👑 Super Admin Platform Control
- **Merchant Onboarding**: Complete control over the platform ecosystem. Approve or reject pending store registrations with automatic Nodemailer email status alerts.
- **Global Dashboards**: High-level visual analytics using **Recharts** to track category breakdowns, monthly revenue growth, top-performing stores, and platform registrations.
- **Platform Auditing**: Global monitoring and moderation capabilities across all orders, customers, and active shops.

---

## 🛠 Technology Stack

### Frontend Architecture
- **Framework**: React 18 (with React Router v7)
- **State Management**: React Context API (Redux-like StoreContext)
- **Styling**: Vanilla CSS with modern CSS Variables, Flexbox, and Grid (Zero external CSS frameworks for maximum customization)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Alerts**: React Toastify

### Backend Architecture
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS password hashing
- **Security**: Helmet, Express-Rate-Limit, CORS dynamic mapping
- **Media Storage**: Cloudinary SDK (Direct Base64 upload streams)
- **Email Service**: Nodemailer
- **Payments**: Razorpay Node SDK

---

## 🚀 Getting Started

### 1. Prerequisites
You will need [Node.js](https://nodejs.org) installed on your machine and access to a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

### 2. Backend Setup
Navigate to the `backend/` directory and install the dependencies:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the following variables:
```env
MONGO_URL=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret_phrase
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
EMAIL_USER=your_nodemailer_email_username
EMAIL_PASS=your_nodemailer_email_password
FRONTEND_URL=http://localhost:3000
```

Seed the initial Super Admin account and start the server:
```bash
npm run seed
npm start
```

### 3. Frontend Setup
Navigate to the `frontend/` directory and install the dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:
```bash
npm start
```

---

## ☁️ Deployment Guide

### Backend (Render / Heroku)
1. Create a Web Service and link this repository.
2. Set the Root Directory to `backend/`.
3. Set the Build Command to `npm install` and the Start Command to `npm start`.
4. Inject all backend `.env` variables into the host's Environment Variables settings.

### Frontend (Netlify / Vercel)
1. Create a new site from your Git repository.
2. Set the Base Directory to `frontend/`.
3. Set the Build Command to `npm run build` and the Publish Directory to `frontend/build`.
4. Add the `REACT_APP_API_URL` environment variable pointing to your deployed backend URL (e.g., `https://your-backend-url.onrender.com/api`).

---

<div align="center">
  <p>Built with ❤️ for luxury e-commerce experiences.</p>
</div>
