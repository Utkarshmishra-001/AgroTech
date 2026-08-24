import pandas as pd
import numpy as np
import os

# Create datasets directory
os.makedirs("datasets", exist_ok=True)

print("Generating representative Kaggle Datasets for AgroTech Backend...")

# 1. Crop Recommendation Dataset (Kaggle: Crop Recommendation Dataset)
# Features: N, P, K, temperature, humidity, ph, rainfall, label
n_samples = 2200
crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee']
np.random.seed(42)

df_crop = pd.DataFrame({
    'N': np.random.randint(0, 140, n_samples),
    'P': np.random.randint(5, 145, n_samples),
    'K': np.random.randint(5, 205, n_samples),
    'temperature': np.random.uniform(8.8, 43.6, n_samples),
    'humidity': np.random.uniform(14.2, 99.9, n_samples),
    'ph': np.random.uniform(3.5, 9.9, n_samples),
    'rainfall': np.random.uniform(20.2, 298.5, n_samples),
    'label': np.random.choice(crops, n_samples)
})
df_crop.to_csv("datasets/Crop_Recommendation_Kaggle.csv", index=False)
print("Created: datasets/Crop_Recommendation_Kaggle.csv")

# 2. Daily Mandi Market Prices Dataset (Kaggle: Daily APMC/Mandi Prices India)
mandis = ['Indore', 'Bhopal', 'Ujjain', 'Jabalpur', 'Gwalior', 'Sagar']
df_market = pd.DataFrame({
    'date': pd.date_range(end=pd.Timestamp.today(), periods=1000).strftime('%Y-%m-%d'),
    'state': 'Madhya Pradesh',
    'district': np.random.choice(mandis, 1000),
    'market': np.random.choice(mandis, 1000),
    'commodity': np.random.choice(['Wheat', 'Soybean', 'Gram', 'Maize', 'Paddy(Dhan)'], 1000),
    'min_price': np.random.randint(1500, 3000, 1000),
    'max_price': np.random.randint(2000, 4000, 1000),
    'modal_price': np.random.randint(1800, 3500, 1000)
})
df_market.to_csv("datasets/Market_Prices_Kaggle.csv", index=False)
print("Created: datasets/Market_Prices_Kaggle.csv")

# 3. Plant Pathology / Pest Dataset (Kaggle: Plant Village Disease Dataset metadata)
df_pest = pd.DataFrame({
    'image_id': [f"img_{i}.jpg" for i in range(500)],
    'crop': np.random.choice(['Apple', 'Corn', 'Potato', 'Tomato', 'Wheat'], 500),
    'disease_label': np.random.choice(['Healthy', 'Early Blight', 'Late Blight', 'Yellow Rust', 'Leaf Spot'], 500),
    'severity': np.random.choice(['Low', 'Medium', 'High'], 500),
    'solution': 'Apply recommended fungicide and remove infected leaves.'
})
df_pest.to_csv("datasets/Plant_Pathology_Kaggle.csv", index=False)
print("Created: datasets/Plant_Pathology_Kaggle.csv")

# 4. Indian Agricultural Government Schemes (Kaggle based on India Govt Data)
schemes = [
    ("PM Kisan Samman Nidhi", "₹6000 per year income support for farmers."),
    ("PM Fasal Bima Yojana", "Crop insurance scheme for natural calamities."),
    ("Soil Health Card Scheme", "Promoting soil test based nutrient management."),
    ("Kisan Credit Card (KCC)", "Short term credit limit for crops and term loan."),
    ("Paramparagat Krishi Vikas", "Promoting organic farming and certification.")
]
df_schemes = pd.DataFrame(schemes, columns=['scheme_name', 'description'])
df_schemes['eligibility'] = 'All Indian Farmers'
df_schemes['url'] = 'https://agricoop.nic.in'
df_schemes.to_csv("datasets/Govt_Schemes_Kaggle.csv", index=False)
print("Created: datasets/Govt_Schemes_Kaggle.csv")

# 5. Drone Spraying & Services Dataset (Proxy for agricultural machinery data)
df_drone = pd.DataFrame({
    'service_id': range(1, 101),
    'farm_size_acres': np.random.uniform(1.0, 50.0, 100),
    'crop_type': np.random.choice(['Rice', 'Cotton', 'Wheat', 'Soybean'], 100),
    'chemical_used': np.random.choice(['Urea Spray', 'Pesticide X', 'Fungicide Y'], 100),
    'water_saved_liters': np.random.uniform(500, 2000, 100),
    'cost_inr': np.random.uniform(1000, 10000, 100)
})
df_drone.to_csv("datasets/Drone_Services_Kaggle.csv", index=False)
print("Created: datasets/Drone_Services_Kaggle.csv")

# 6. Global Weather and Climate for Agriculture (Kaggle)
df_weather = pd.DataFrame({
    'date': pd.date_range(end=pd.Timestamp.today(), periods=365).strftime('%Y-%m-%d'),
    'temp_avg': np.random.uniform(15.0, 35.0, 365),
    'humidity_avg': np.random.uniform(30.0, 90.0, 365),
    'rainfall_mm': np.random.uniform(0.0, 50.0, 365),
    'wind_speed_kmh': np.random.uniform(5.0, 25.0, 365),
    'severe_alert': np.random.choice([0, 1], 365, p=[0.9, 0.1])
})
df_weather.to_csv("datasets/Weather_Agri_Kaggle.csv", index=False)
print("Created: datasets/Weather_Agri_Kaggle.csv")

print("All representative Kaggle datasets generated successfully in backend/datasets/")
