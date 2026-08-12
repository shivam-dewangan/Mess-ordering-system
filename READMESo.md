# 🍱 CampusEats — Campus Mess Order App

A full-stack MERN application that lets students order food from campus mess & cafeterias, skip queues, and track orders in real-time.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

---

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

### 3. Seed Sample Data

Once both servers are running, visit:
```
http://localhost:3000
```

Login page has **"Load Sample Data"** — click it, or call the API directly:
```
POST http://localhost:5000/api/admin/seed
```

This creates:
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@campus.com       | admin123    |
| Student | student@campus.com     | student123  |

---

## 🏗️ Project Structure

```
campus-mess-app/
├── backend/
│   ├── models/         # Mongoose models (User, Shop, MenuItem, Order)
│   ├── routes/         # Express routes (auth, menu, orders, shops, admin)
│   ├── middleware/      # JWT auth middleware
│   ├── server.js       # Main server + Socket.IO
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/    # AuthContext, CartContext
        ├── pages/      # Login, Register, Home, ShopMenu, Cart, OrderTracking, MyOrders
        │   └── admin/  # AdminDashboard, AdminOrders, AdminMenu
        ├── components/ # Navbar
        └── App.jsx
```

---

## ✨ Features

### Student Side
- 🔐 Register / Login
- 🏪 Browse open shops
- 🍛 View menu with categories (Veg/Non-Veg filter)
- 🛒 Add to cart (multi-item, qty control)
- 📦 Place orders (Cash / UPI / Card)
- 🔢 Get token number
- 📲 Live order tracking with real-time socket updates
- 📋 Order history

### Admin / Shop Owner Side
- 📊 Dashboard with today's stats (orders, revenue, pending)
- 🔴 Open/Close shop toggle
- 📋 Real-time incoming orders (Socket.IO alerts)
- ✅ Update order status: Confirm → Preparing → Ready → Complete
- 🍽️ Full menu management (Add / Edit / Toggle / Delete items)

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Vite     |
| Styling    | Pure CSS (custom design system)     |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (JSON Web Tokens)               |
| Real-time  | Socket.IO                           |
| HTTP       | Axios                               |

---

## 🌐 Deploy on Azure

```
Frontend  → Azure Static Web Apps (npm run build → dist/)
Backend   → Azure App Service (Node.js 18)
Database  → MongoDB Atlas (free tier) or Azure Cosmos DB
```

Set environment variables in Azure App Service:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — a long random string
- `NODE_ENV=production`
