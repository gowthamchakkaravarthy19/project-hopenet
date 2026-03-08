# HopeNet 🕊️

A full-stack web application designed to locally connect **Donors** (people with surplus food or goods) with nearby **Receivers** (NGOs, orphanages, and individuals in need) using real-time GPS-based proximity matching.

## 🌟 Key Features

- **Role-Based Workflows**: Tailored, isolated experiences and dashboards depending on whether a user registers as a Donor or Receiver.
- **Geospatial Proximity Matching**: Utilizes MongoDB's `2dsphere` indexes and Leaflet interactive maps to automatically show Receivers the donations closest to their physical location.
- **Real-Time Notifications**: Instant, live updates powered by Socket.IO and Web Push integration. Users are notified immediately when a donation is created nearby or a request state changes.
- **Request & Fulfill System**: A dedicated pipeline for Receivers to actively request items. Donors receive these requests in a unified Tracker tab where they can easily Accept or Reject them.
- **Secure Authentication**: End-to-end security using HTTP-only JWT cookies, encrypted passwords (bcrypt), and protected API routes.

---

## 🛠️ Tech Stack

**Frontend (`/client`)**
- React 18 (Vite)
- Tailwind CSS (Styling)
- Zustand (State Management)
- React Router v6 (Navigation)
- Axios (API Client)
- Leaflet Maps & React-Leaflet
- Socket.IO Client

**Backend (`/server`)**
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO (WebSockets)
- Cloudinary (Image Uploads)
- Web-Push (Push Notifications)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB locally installed or a MongoDB Atlas URI
- A Cloudinary Free Account (for image uploads)

### 1. Clone & Install
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables
Create a `.env` file inside the `/server` folder. (Use `.env.example` as a template).

```env
# /server/.env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hopenet
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Cloudinary keys
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# VAPID Keys for Push Notifications
# Generate by running: npx web-push generate-vapid-keys
VAPID_EMAIL=mailto:your_email@example.com
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

Create a `.env` file inside the `/client` folder:

```env
# /client/.env
VITE_API_URL=http://localhost:5000
```

### 3. Run the Application
Open two separate terminals:

**Terminal 1 (Backend)**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌍 Production Deployment

### Backend (Render)
1. Create a Web Service on Render linked to the `/server` directory.
2. Add all the environment variables from your local `.env`.
3. Set `CLIENT_URL` to your future frontend deployment URL (e.g., `https://hopenet.vercel.app`).

### Frontend (Vercel)
1. Import the `/client` directory into a new Vercel project.
2. Set the Environment Variable `VITE_API_URL` to your Render backend URL (e.g., `https://hopenet-api.onrender.com`).
3. Deploy!

---

## 📄 License
This project is open-source and ready for global impact.
