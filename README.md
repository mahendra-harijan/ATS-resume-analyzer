# 🚀 Resume Analyzer (ATS Scoring)

A full-stack web application that evaluates resumes against job descriptions and generates an **ATS-style analysis report** with scores, missing keywords, and actionable recommendations.

---

## ✨ Features

- 🔐 Secure authentication (JWT + refresh tokens)
- 📄 Resume upload (PDF / DOCX) with text extraction
- 📊 ATS score with section-wise breakdown
- 🔍 Missing keyword detection
- 💡 Smart recommendations
- 🕘 History tracking (view & delete reports)
- 🎨 Modern UI with animations and score indicators

---

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Zod (validation)
- Groq API (LLM scoring)

### Frontend
- React + Vite
- Fetch wrapper (auto token refresh)

---

## 📁 Project Structure

resume-analyzer/
│
├── backend/      # Express API
├── frontend/     # React app
└── README.md

---

## ⚙️ Prerequisites

- Node.js >= 22
- MongoDB (local or cloud)
- Groq API Key

---

## 🚀 Setup

### 1️⃣ Backend Setup

Run:

cd backend
npm install

Create `.env` file inside backend folder:

NODE_ENV=development  
PORT=5000  
MONGODB_URI=mongodb://127.0.0.1:27017/resumeanalyser  

JWT_ACCESS_SECRET=your_access_secret  
JWT_REFRESH_SECRET=your_refresh_secret  

GROQ_API_KEY=your_groq_api_key  
GROQ_MODEL=llama-3.1-8b-instant  

CLIENT_ORIGIN=http://localhost:5173  

FILE_MAX_BYTES=5242880  
FILE_ALLOWED_MIMETYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document  

Start backend:

npm start

👉 Backend runs on: http://localhost:5000

---

### 2️⃣ Frontend Setup

Run:

cd frontend  
npm install  

(Optional) Create `.env` in frontend:

VITE_API_BASE_URL=http://localhost:5000  

Start frontend:

npm run dev  

👉 Frontend runs on: http://localhost:5173

---

## 🌐 API Overview

Base URL:  
http://localhost:5000/api

---

### 🔐 Auth Routes

POST /auth/signup → Register user  
POST /auth/login → Login user  
POST /auth/refresh → Refresh token  
POST /auth/logout → Logout  

---

### 📊 Analysis Routes (Protected)

---

## ✅ Production Deploy (Vercel + Render)

### Backend on Render

1) Push your code to GitHub.

2) Create a Render **Web Service**:
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

3) Set environment variables in Render (Service → Settings → Environment):
- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app`
- `MONGODB_URI=<your mongo connection string>`
- `JWT_ACCESS_SECRET=<long random secret>`
- `JWT_REFRESH_SECRET=<long random secret>`
- `GROQ_API_KEY=<your key>` (or `GEMINI_API_KEY` for backward compatibility)

Notes:
- This backend is **JWT-based**; you do **not** need `express-session` / `connect-mongo`.
- In production, the backend will **fail fast** if required secrets are missing.

Your backend URL will be like:
- `https://<render-service-name>.onrender.com`

### Frontend on Vercel

1) Import the repo into Vercel.

2) Project settings:
- **Root Directory**: `frontend`
- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

3) Set environment variables in Vercel (Project → Settings → Environment Variables):
- `VITE_API_BASE_URL=https://<render-service-name>.onrender.com`

### CORS wiring

For production to work:
- Backend `CLIENT_ORIGIN` must match your Vercel origin exactly.
- Frontend `VITE_API_BASE_URL` must point to your Render backend.

Header:  
Authorization: Bearer <accessToken>

POST /analysis/analyze → Upload resume + job description  
GET /analysis/history → Get history  
GET /analysis/report/:reportId → Get report  
DELETE /analysis/report/:reportId → Delete report  

---

## 🧪 Scripts

Frontend:

npm run dev  
npm run build  
npm run lint  

Backend:

npm start  

---

## ⚠️ Troubleshooting

- MongoDB not running → 503 Database unavailable  
- Invalid ATS JSON → Model response format issue  
- Backend changes not applied → Restart server  

---

## 💡 Future Improvements

- Resume score visualization charts  
- Multi-job comparison  
- AI resume rewriting  
- Export reports as PDF/Word  

---

## 🤝 Contributing

Feel free to fork and submit pull requests.

---

## 📜 License

MIT License

---
---

## 💡 Author

Developed by **Mahendra Harijan**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!