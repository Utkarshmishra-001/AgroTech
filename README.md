# 🌾 AgroTech - Smart Crop Advisory & Precision Farming Platform

AgroTech is a full-featured, data-driven agricultural advisory web platform built to empower farmers with modern AI tools, digital soil testing, live mandi market prices, pest diagnosis, drone service booking, and curated government schemes.

---

## 🚀 Key Features

1. **🌾 Smart Crop Advisory**: Comprehensive cultivation guides, ideal soil types, temperature ranges, and rainfall data for 30+ major crops.
2. **🧪 Digital Soil Lab**: Input N-P-K & pH levels to calculate precise fertilizer dosages (Urea, DAP, MOP, Gypsum/Lime) and ML-powered optimal crop recommendations.
3. **☁️ Live Weather & AI Advice**: Real-time weather detection via Open-Meteo API with localized crop management tips.
4. **📈 Live Market Prices (MP Mandi)**: Real-time price tracking across Madhya Pradesh mandis with min, max, modal prices and trend indicators.
5. **🪲 AI Pest & Disease Scanner**: Instant plant disease identification with chemical & biological treatment solutions.
6. **🏛️ Government Schemes**: Curated central & state agriculture schemes (PM-Kisan, PMFBY, KCC, Soil Health Card, PMKSY, e-NAM, etc.).
7. **🚁 Drone Sprayer Service**: High-tech drone booking system for precision pesticide and fertilizer spraying.
8. **🔐 Farmer Authentication & Admin Dashboard**: Complete role-based access for farmers and administrators with full CRUD capabilities for crops, schemes, soil reports, and drone bookings.
9. **🌐 Dual-Mode Deployment**: Works 100% standalone out-of-the-box on static hosting (GitHub Pages / Netlify / Vercel) with intelligent LocalStorage and heuristics fallback, plus full sync with FastAPI cloud backend.

---

## 👥 Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Demo Farmer** | `demo@gmail.com` | `demo123` |
| **Administrator** | `admin@gmail.com` | `admin123` |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Glassmorphism UI, Responsive Grid), JavaScript (ES6+), FontAwesome 6
- **Backend**: Python (FastAPI), Uvicorn, Pandas, NumPy, Pydantic
- **Datasets**: 6 Datasets covering Crop Recommendations, Market Prices, Plant Pathology, Government Schemes, Drone Services, and Agricultural Weather.
- **APIs**: Open-Meteo Weather API, Google Gemini AI (Optional Vision/Text)

---

## 💻 How to Run Locally

### 1. Run Frontend Directly
Double-click `index.html` or open with VS Code Live Server (`http://127.0.0.1:5500`). All frontend features work standalone immediately!

### 2. Run FastAPI Backend (Optional for dataset API & MongoDB sync)
```bash
# Double-click run_backend.bat on Windows
# OR via terminal:
cd backend
pip install -r requirements.txt
python main.py
```
The backend will run on `http://127.0.0.1:8005`.

---

## 🌐 How to Upload to GitHub & Deploy Live

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "AgroTech - Precision Farming & Smart Crop Advisory System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AgroTech.git
git push -u origin main
```

### Step 2: Deploy Frontend Live (GitHub Pages - 100% Free)
1. Go to your GitHub Repository > **Settings** > **Pages**.
2. Under **Branch**, select `main` and root `/` folder.
3. Click **Save**.
4. Your site will be live at `https://YOUR_USERNAME.github.io/AgroTech/` within 1 minute!

### Step 3: Deploy Backend Live (Render / Railway - Optional)
1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Set:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Click **Deploy**.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
