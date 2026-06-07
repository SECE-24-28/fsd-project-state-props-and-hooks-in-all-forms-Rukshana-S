# WEARLY - Premium Multi-Vendor Clothing & Fashion Marketplace

WEARLY is a state-of-the-art multi-vendor e-commerce platform designed to bring independent verified clothing merchants and design boutiques together in a single premium storefront. Modeled after premium storefront architectures like Shopify, Amazon, and Myntra, WEARLY features role-based panels, Razorpay sandbox payment flows, real-time Nodemailer email updates, Cloudinary image hosting, interactive review modules, and aggregation sales dashboards.

---

## 🚀 Features

### 🛍 Customer Experience
- **Interactive Catalog**: Search by name, brand, store, or category with instant debounced queries and advanced database sorting options (Newest, Popularity, Price Asc/Desc, Best Rated).
- **Responsive Media Gallery**: Interactive hover zoom effect on main images and smooth thumbnail transitions.
- **Cart & Wishlist**: Real-time item additions, size/color selections, price recalculation, and stock restriction safeguards.
- **Coupons**: Flat and percentage-based discounts applied on the checkout page.
- **Payment Gateway**: Sandbox payment integration utilizing Razorpay SDK with secure backend HMAC-SHA256 signature verification.
- **Addresses Profile**: Multiple saved addresses management.
- **Order Timeline Tracker**: Horizontal tracking interface showing status stages (`Pending`, `Processing`, `Shipped`, `Delivered`).
- **Product Reviews**: Customer ratings (1-5 stars) and comment threads with dynamic pre-aggregated product scores.

### 🏪 Store Admin Dashboard
- **Product Inventory Manager**: CRUD product items (up to 5 images per product with drag/reorder/delete options, sizes, and colors).
- **Sales Analytics**: MongoDB aggregation pipelines filtering orders, revenues, and buyers strictly for the merchant's products.
- **CSV Data Export**: Export local catalogs, customer segments, and order lists directly to CSV format.

### 👑 Super Admin Platform Control
- **Merchant Onboarding**: Approve/reject pending store registrations with automatic email status alerts.
- **Global Dashboards**: Charts tracking category breakdowns, monthly revenue growths, store revenues comparisons, and platform registrations using Recharts.
- **Auditing**: Global monitoring of orders, customers, and active shops.

---

## 🛠 Tech Stack

- **Frontend**: React (Context API, Axios, Recharts, React Router v7)
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Email System**: Nodemailer
- **Payments**: Razorpay Node SDK (sandbox)
- **Image Storage**: Cloudinary SDK (Direct Base64 upload stream)
- **Security**: Helmet, Express-Rate-Limit, CORS dynamic mapping, BcryptJS, JWT

---

## 📂 Folder Structure

```
ecommerce/
├── backend/
│   ├── Controllers/
│   │   ├── CartController.js
│   │   ├── CouponController.js
│   │   ├── OrderController.js
│   │   ├── PaymentController.js
│   │   ├── ProductController.js
│   │   ├── ReviewController.js
│   │   ├── StoreAdminController.js
│   │   ├── SuperAdminController.js
│   │   └── UserController.js
│   ├── Middlewares/
│   │   └── errorMiddleware.js
│   ├── Models/
│   │   ├── CartModel.js
│   │   ├── CouponModel.js
│   │   ├── NotificationModel.js
│   │   ├── OrderModel.js
│   │   ├── ProductModel.js
│   │   ├── ReviewModel.js
│   │   └── UserModel.js
│   ├── Routes/
│   │   ├── CartRoutes.js
│   │   ├── CouponRoutes.js
│   │   ├── OrderRoutes.js
│   │   ├── PaymentRoutes.js
│   │   ├── ProductRoutes.js
│   │   ├── ReviewRoutes.js
│   │   ├── StoreAdminRoutes.js
│   │   ├── SuperAdminRoutes.js
│   │   └── UserRoutes.js
│   ├── Utils/
│   │   ├── cloudinary.js
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   ├── verifyToken.js
│   │   └── seedSuperAdmin.js
│   └── Server.js
└── frontend/
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── service-worker.js
    └── src/
        ├── Components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── ProductCard.jsx
        ├── Pages/
        │   ├── Homepage.jsx
        │   ├── Products.jsx
        │   ├── ProductDetails.jsx
        │   ├── Checkout.jsx
        │   ├── OrderSuccess.jsx
        │   └── Register.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── StoreContext.jsx
        ├── services/
        │   └── api.js
        ├── serviceWorkerRegistration.js
        └── index.js
```

---

## 🔧 Installation & Local Run

### 1. Prerequisites
Install [Node.js](https://nodejs.org) and run a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

### 2. Backend Configurations
Navigate to `backend/` and run:
```bash
npm install
```
Create a `.env` file inside `backend/`:
```env
MONGO_URL=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret_phrase
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=rzp_test_SyN7nvYNEU6ojM
RAZORPAY_SECRET=OFqv5uf8GckNN0widblySMBP
EMAIL_USER=your_nodemailer_email_username
EMAIL_PASS=your_nodemailer_email_password
FRONTEND_URL=http://localhost:3000
```
Seed the Super Admin account:
```bash
npm run seed
```
Start the server:
```bash
npm start
```

### 3. Frontend Configurations
Navigate to `frontend/` and run:
```bash
npm install
```
Create a `.env` file inside `frontend/`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
Start the React App:
```bash
npm start
```

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/users/register` | Register customer / store-admin | None |
| **POST** | `/api/users/login` | Login user & fetch token | None |
| **GET** | `/api/products` | Query products catalog | None |
| **POST** | `/api/reviews` | Post/update customer rating | Customer |
| **POST** | `/api/coupons/apply` | Validate coupon discounts | Customer |
| **POST** | `/api/payment/create-order` | Generate Razorpay transaction order | Customer |
| **POST** | `/api/payment/verify` | Verify signatures & create order record | Customer |
| **GET** | `/api/storeadmin/analytics` | Aggregated revenue/order statistics | Store Admin |
| **PUT** | `/api/superadmin/approve/:id` | Approve store registration application | Super Admin |

---

## ☁️ Deployment Guide

### Backend on Render
1. Create a Web Service on Render.
2. Link your GitHub repository.
3. Configure the start command: `node backend/Server.js` or `npm start` (set root directory to `backend`).
4. Inject your environment variables inside the Environment settings on Render.

### Frontend on Netlify
1. Create a Site on Netlify from GitHub.
2. Set build command: `npm run build` (build directory `frontend/build`).
3. Add environment variable: `REACT_APP_API_URL` pointing to your Render backend URL `/api`.
