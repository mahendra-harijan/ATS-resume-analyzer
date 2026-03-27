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