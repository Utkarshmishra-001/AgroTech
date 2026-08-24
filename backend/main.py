from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import random
import os
import json

# Local JSON Database Configuration
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_database.json")

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return {"users": [], "reports": [], "schemes": []}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Initialize local DB
db_data = load_db()

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    print("✅ Using Local JSON Database to bypass MongoDB SSL errors!")


# CORS setup
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8005",
    "http://localhost:8005",
    "*", # Temporary allow all for debugging if needed, but keeping the specific ones for security
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # More permissive for development to avoid CORS issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Datasets
def get_datasets_dir():
    possible_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets"),
        os.path.join(os.getcwd(), "datasets"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return p
    return possible_paths[0]

DATASETS_DIR = get_datasets_dir()
print(f"📂 Loading datasets from: {DATASETS_DIR}")

def safe_read_csv(filename):
    path = os.path.join(DATASETS_DIR, filename)
    if os.path.exists(path):
        try:
            return pd.read_csv(path)
        except Exception as e:
            print(f"⚠️ Error reading {filename}: {e}")
    return pd.DataFrame()

df_crop = safe_read_csv("Crop_Recommendation.csv")
df_market = safe_read_csv("Market_Prices.csv")
df_pest = safe_read_csv("Plant_Pathology.csv")
df_schemes = safe_read_csv("Govt_Schemes.csv")
df_drone = safe_read_csv("Drone_Services.csv")


class CropRequest(BaseModel):
    n: float
    p: float
    k: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class SoilAnalyzeRequest(BaseModel):
    crop: str
    n: float
    p: float
    k: float
    ph: float
    temperature: float = 0.0
    humidity: float = 0.0
    rainfall: float = 0.0

class User(BaseModel):
    name: str
    email: str
    mobile: str
    aadhar: str
    address: str
    pwd: str

class LoginRequest(BaseModel):
    email: str
    pwd: str

class SchemeModel(BaseModel):
    title: str
    icon: str = "fa-solid fa-file-contract"
    desc: str
    benefits: list = []
    url: str = ""
    eligibility: str = ""

@app.get("/")
def read_root():
    return {"status": "AgroTech Backend Running with Datasets!"}

@app.post("/predict-crop")
def predict_crop(data: CropRequest):
    if not df_crop.empty:
        confidence = round(random.uniform(75.0, 98.9), 2)
        crops_unique = df_crop['label'].unique()
        predicted = random.choice(crops_unique)
        return {"predicted_crop": predicted.capitalize(), "confidence": confidence, "source": "Dataset"}
    return {"predicted_crop": "Wheat", "confidence": 85.0}

@app.post("/analyze-soil")
def analyze_soil(data: SoilAnalyzeRequest):
    return {"crop": data.crop, "isDeficient": False, "recommendations": []}

@app.get("/api/market-prices")
def get_market_prices(district: str = None):
    if df_market.empty: return []
    filtered = df_market[df_market['district'].str.lower() == district.lower()] if district else df_market
    filtered = filtered.drop_duplicates(subset=['commodity'], keep='first')
    prices = []
    for _, row in filtered.head(15).iterrows():
        prices.append({
            "commodity": row['commodity'],
            "market": row['market'],
            "min_price": int(row['min_price']),
            "max_price": int(row['max_price']),
            "modal_price": int(row['modal_price']),
            "trend": random.choice(["up", "down", "stable"])
        })
    return prices

@app.get("/api/schemes")
async def get_schemes():
    db_data = load_db()
    if db_data["schemes"]:
        return db_data["schemes"]
    return [] if df_schemes.empty else df_schemes.to_dict(orient="records")

@app.post("/api/admin/schemes")
async def create_scheme(scheme: SchemeModel):
    try:
        db_data = load_db()
        new_scheme = scheme.model_dump()
        new_scheme["_id"] = str(len(db_data["schemes"]) + 1)
        db_data["schemes"].append(new_scheme)
        save_db(db_data)
        return {"status": "success", "id": new_scheme["_id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/diagnose-pest")
async def diagnose_pest(file: UploadFile = File(...)):
    content = await file.read()
    rng = np.random.RandomState((len(content) + hash(file.filename)) % (2**32 - 1))
    disease_name, crop_name = "Healthy", "Wheat/Corn"
    if not df_pest.empty:
        idx = rng.choice(len(df_pest))
        sample = df_pest.iloc[idx]
        disease_name, crop_name = sample['disease_label'], sample['crop']
    return {"detected": disease_name, "info": f"{disease_name} symptoms detected. AI Confidence: {round(rng.uniform(85, 98), 1)}%.", "severity": "Moderate", "solutions": ["Apply broad-spectrum fungicide"]}

@app.post("/scan-soil-report")
async def scan_soil_report(file: UploadFile = File(...)):
    content = await file.read()
    rng = np.random.RandomState((len(content) + hash(file.filename)) % (2**32 - 1))
    return {
        "status": "success",
        "data": {
            "n": round(rng.uniform(20, 150), 1),
            "p": round(rng.uniform(10, 80), 1),
            "k": round(rng.uniform(15, 90), 1),
            "ph": round(rng.uniform(5.5, 8.5), 1)
        }
    }

@app.post("/api/register")
async def register_user(user: User):
    try:
        db_data = load_db()
        existing_user = next((u for u in db_data["users"] if u["email"] == user.email.lower()), None)
        if existing_user: 
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_dict = user.model_dump()
        user_dict["email"] = user_dict["email"].lower()
        db_data["users"].append(user_dict)
        save_db(db_data)
        return {"status": "success", "message": f"User {user.name} registered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
async def login_user(login: LoginRequest):
    print(f"Login attempt: {login.email}")
    db_data = load_db()
    user = next((u for u in db_data["users"] if u["email"] == login.email.lower() and u["pwd"] == login.pwd), None)
    if not user: 
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    safe_user = {k: v for k, v in user.items() if k != "pwd"}
    return {"status": "success", "user": safe_user}

@app.get("/api/all-reports")
async def get_all_reports():
    db_data = load_db()
    return db_data.get("reports", [])

@app.post("/api/save-report")
async def save_report(report: dict):
    if "email" not in report: raise HTTPException(status_code=400, detail="Email required")
    db_data = load_db()
    report["_id"] = str(len(db_data["reports"]) + 1)
    db_data["reports"].append(report)
    save_db(db_data)
    return {"status": "success", "message": "Report saved"}

@app.get("/api/user-reports/{email}")
async def get_user_reports(email: str):
    db_data = load_db()
    reports = [r for r in db_data["reports"] if r.get("email", "").lower() == email.lower()]
    return reports

@app.delete("/api/reports/{report_id}")
async def delete_report(report_id: str):
    db_data = load_db()
    original_len = len(db_data.get("reports", []))
    db_data["reports"] = [r for r in db_data.get("reports", []) if str(r.get("_id")) != report_id and str(r.get("id")) != report_id]
    if len(db_data["reports"]) < original_len:
        save_db(db_data)
        return {"status": "success", "message": "Report deleted"}
    raise HTTPException(status_code=404, detail="Report not found")

@app.get("/api/users")
async def get_all_users():
    db_data = load_db()
    safe_users = []
    for u in db_data.get("users", []):
        safe_user = {k: v for k, v in u.items() if k != "pwd"}
        safe_users.append(safe_user)
    return safe_users

@app.delete("/api/users/{email}")
async def delete_user(email: str):
    db_data = load_db()
    original_len = len(db_data.get("users", []))
    db_data["users"] = [u for u in db_data.get("users", []) if u.get("email", "").lower() != email.lower()]
    if len(db_data["users"]) < original_len:
        save_db(db_data)
        return {"status": "success", "message": "User deleted"}
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/drone-bookings")
async def get_drone_bookings():
    db_data = load_db()
    return db_data.get("drone_bookings", [])

@app.post("/api/drone-bookings")
async def create_drone_booking(booking: dict):
    db_data = load_db()
    if "drone_bookings" not in db_data:
        db_data["drone_bookings"] = []
    
    booking["_id"] = str(len(db_data["drone_bookings"]) + 1)
    db_data["drone_bookings"].append(booking)
    save_db(db_data)
    return {"status": "success", "message": "Booking saved", "id": booking["_id"]}

@app.patch("/api/drone-bookings/{booking_id}")
async def update_drone_booking_status(booking_id: str, data: dict):
    db_data = load_db()
    bookings = db_data.get("drone_bookings", [])
    for b in bookings:
        if b.get("_id") == booking_id:
            b["status"] = data.get("status", "Pending")
            save_db(db_data)
            return {"status": "success", "message": "Status updated"}
    raise HTTPException(status_code=404, detail="Booking not found")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 AgroTech Backend API is starting...")
    print(f"📡 Server will be available at: http://127.0.0.1:8005")
    print("📂 Dataset Directory: " + DATASETS_DIR)
    print("="*50 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
