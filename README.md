✦ Resume Analyzer
AI-powered ATS scoring, keyword analysis, and resume builder — all in one place.
Upload your resume. Paste a job description. Get a detailed ATS score, missing keyword report, section-wise breakdown, and smart recommendations — instantly.
<br />
Features · Tech Stack · Getting Started · API Reference · Roadmap

</div>
✨ Features
FeatureDescription🔐 Secure AuthJWT-based login with access & refresh token rotation📄 Resume UploadSupports PDF & DOCX with automatic text extraction🤖 AI ATS ScoringLLM-powered analysis with an overall ATS score📊 Section BreakdownIndividual scores for skills, experience, education & more🔍 Keyword DetectionIdentifies missing keywords from the job description💡 Smart RecommendationsActionable suggestions to improve your resume✏️ Resume BuilderCreate a polished resume from scratch directly in the app🕘 History TrackingView, revisit, and delete past analysis reports🎨 Modern UISmooth animations, score indicators, and a clean interface

🛠 Tech Stack
<table>
<tr>
<td valign="top" width="50%">
Backend

Runtime — Node.js >= 22
Framework — Express
Database — MongoDB + Mongoose
Validation — Zod
AI / LLM — Groq API (llama-3.1-8b-instant)
Auth — JWT (access + refresh tokens)

</td>
<td valign="top" width="50%">
Frontend

Framework — React + Vite
HTTP — Custom fetch wrapper with auto token refresh
Styling — Modern CSS with animations & score indicators

</td>
</tr>
</table>

📁 Project Structure
resume-analyzer/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── routes/           # Auth & analysis routes
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── middleware/        # Auth, validation, error handling
│   │   └── services/         # Groq AI, file parsing
│   └── .env                  # Environment variables
│
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── pages/            # Dashboard, Analyze, Builder, History
│   │   ├── components/       # Reusable UI components
│   │   └── lib/              # Fetch wrapper, helpers
│   └── .env                  # Vite env vars
│
└── README.md

Prerequisites
Before you begin, make sure you have:

Node.js >= 22
MongoDB (local instance or MongoDB Atlas)
Groq API Key — get one free at console.groq.com


🚀 Getting Started
1 · Clone the repository
bashgit clone https://github.com/your-username/resume-analyzer.git
cd resume-analyzer

2 · Backend Setup
bashcd backend
npm install
Create a .env file inside the backend/ folder:
env# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/resumeanalyser

# Auth
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# AI
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# CORS
CLIENT_ORIGIN=http://localhost:5173

# File Upload
FILE_MAX_BYTES=5242880
FILE_ALLOWED_MIMETYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document
Start the backend server:
bashnpm start

Backend running at http://localhost:5000


3 · Frontend Setup
bashcd frontend
npm install
Optionally, create a .env file inside frontend/:
envVITE_API_BASE_URL=http://localhost:5000
Start the dev server:
bashnpm run dev

Frontend running at http://localhost:5173


🌐 API Reference
Base URL: http://localhost:5000/api
🔐 Auth Routes
MethodEndpointDescriptionPOST/auth/signupRegister a new userPOST/auth/loginLogin and receive tokensPOST/auth/refreshRefresh the access tokenPOST/auth/logoutLogout and invalidate tokens

📊 Analysis Routes

All routes require: Authorization: Bearer <accessToken>

MethodEndpointDescriptionPOST/analysis/analyzeUpload resume + job description for ATS analysisGET/analysis/historyFetch all past analysis reportsGET/analysis/report/:reportIdGet a specific report by IDDELETE/analysis/report/:reportIdDelete a report by ID

🧪 Scripts
Frontend
bashnpm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Run ESLint
Backend
bashnpm start         # Start Express server

Troubleshooting
IssueCauseFix503 Database unavailableMongoDB not runningStart MongoDB locally or check your Atlas URIInvalid ATS JSONGroq model response malformedRetry the request or try a different model in .envBackend changes not appliedServer not restartedStop and re-run npm start401 UnauthorizedExpired or missing tokenRe-login; the frontend handles token refresh automatically

🗺 Roadmap

 JWT auth with refresh tokens
 PDF & DOCX text extraction
 AI-powered ATS scoring
 Section-wise breakdown & recommendations
 Resume builder
 Report history with delete support
 Resume score visualization charts
 Multi-job comparison mode
 AI resume rewriting suggestions
 Export reports as PDF / Word
 Browser extension for one-click job analysis


🤝 Contributing
Contributions are welcome! Here's how to get started:

Fork the repository
Create a feature branch — git checkout -b feature/your-feature
Commit your changes — git commit -m 'feat: add your feature'
Push to the branch — git push origin feature/your-feature
Open a Pull Request

Please follow conventional commits and keep PRs focused on a single concern.

📜 License
This project is licensed under the MIT License — see the LICENSE file for details.

<div align="center">
If this project helped you, consider giving it a ⭐ on GitHub — it means a lot!
Built with Node.js · React · Groq AI
</div>