<<<<<<< HEAD
# BloodLife – Blood Donation Platform (MERN)

A full-stack blood donation platform with **Donor** and **Receiver** dashboards, role-based auth, 90-day cooldown, privacy controls, and real-time notifications (Socket.io).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, bcryptjs  
- **Frontend:** React, Vite, React Router, Tailwind CSS, Socket.io client  

## Features

- **Auth:** Register as Donor or Receiver, login with JWT; redirect to role-specific dashboard.
- **Donor dashboard:** Profile CRUD, Enable/Disable profile visibility, 90-day cooldown after donation with countdown, incoming requests list, Accept request (reveals phone to receiver), donation history.
- **Receiver dashboard:** Search donors by city and blood group, Emergency SOS (notifies donors in city), one active request at a time, see donor phone after accept, mark donation complete, rate donor (1–5 stars).
- **Real-time:** Socket.io for new-request (to donors in city) and request-accepted (to receiver).

## Project structure

```
BloodLife/
├── backend/          # Express API + Socket.io
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── config/constants.js
│   │   ├── controllers/  # auth, donor, receiver, request
│   │   ├── middleware/auth.js
│   │   ├── models/       # User, DonationRequest
│   │   └── routes/
│   └── package.json
├── frontend/         # Vite + React
│   ├── src/
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useSocket.js
│   │   ├── lib/api.js
│   │   └── pages/
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
npm run dev
```

Runs on **http://localhost:5000**. Ensure MongoDB is running.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000** and proxies `/api` and `/socket.io` to the backend.

### 3. Environment

- **Backend:** `PORT`, `MONGO_URI`, `JWT_SECRET` (see `.env.example`).

## API overview

- `POST /api/auth/register/donor` – Donor registration  
- `POST /api/auth/register/receiver` – Receiver registration  
- `POST /api/auth/login` – Login (returns user + token)  
- `GET /api/auth/me` – Current user (protected)  
- `GET /api/donors/me`, `PATCH /api/donors/me`, `DELETE /api/donors/me` – Donor profile  
- `PATCH /api/donors/me/availability` – Toggle visibility  
- `GET /api/donors/me/history` – Donation history  
- `GET /api/receivers/search?city=&bloodGroup=` – Search donors (receiver only)  
- `POST /api/receivers/requests`, `GET /api/receivers/requests` – Create / get my requests  
- `GET /api/requests/incoming` – Incoming requests (donor)  
- `POST /api/requests/:id/accept` – Accept request (donor)  
- `POST /api/requests/:id/complete` – Mark completed (donor or receiver)  
- `POST /api/requests/:id/rate` – Rate donor (receiver)  
- `POST /api/requests/:id/cancel` – Cancel request (receiver)  

## Design

- **Colors:** Primary red `#DC2626`, white, light gray.  
- **Layout:** Sidebar (YouTube-style) for both dashboards; landing navbar with BloodLife logo (left), Donor/Receiver registration and Sign in (right).  
- **Responsive:** Tailwind breakpoints for mobile and desktop.
=======
# billo
my first project
>>>>>>> 4d2710abfa669c95c69270d4eccbc3669dcf77fa
