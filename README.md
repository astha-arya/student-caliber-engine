# Student Caliber Engine

An institutional-level diagnostic tool designed to assess the placement readiness of student resume batches using deterministic, rule-based logic.

## 🚀 Live Demo
- **Frontend:** https://student-caliber-engine.vercel.app
- **Backend:** https://student-caliber-backend.onrender.com

## 🧠 The Deterministic Analysis Engine
To ensure maximum precision and ATS compliance, this system replaces generative AI with a high-performance, rule-based analysis engine. It extracts and evaluates resume data through structured logic, providing a transparent and reproducible metric for batch-level readiness.

- **Text Extraction:** Utilizes `pdf-parse` to retrieve raw text buffers.
- **ATS Validation:** Implements Regex patterns and string matching to detect essential links (GitHub, LinkedIn) and contact info.
- **Section Detection:** Scans for institutional requirements like Skills, Projects, Experience, and Education.
- **Action Verb Analysis:** Tracks high-impact engineering verbs (e.g., "architected", "optimized", "engineered") to measure outcome-oriented writing.
- **Institutional Aggregation:** Calculations are performed across the entire batch to identify systemic weaknesses rather than focusing on individual failures.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS v4, TypeScript.
- **Backend:** Node.js, Express, Multer (Memory Storage), TypeScript.
- **Deployment:** Vercel (Frontend) & Render (Backend).

## 📥 Local Setup

1. Clone the repo

```bash
git clone https://github.com/astha-arya/student-caliber-engine.git
cd student-caliber-engine
```

2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Runs on: `http://localhost:5001`

3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on: `http://localhost:3000`

