import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

MODEL_PATH = "risk_model.pkl"
CITY_ENCODER_PATH = "city_encoder.pkl"
PLATFORM_ENCODER_PATH = "platform_encoder.pkl"

WATERLOGGING_SAFE_ZONES = [
    '400001', '400002', '400050', '110001', '110003',
    '560001', '600001', '700001', '500001', '411001',
]

def generate_mock_data(samples=2000):
    cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad']
    platforms = ['zepto', 'blinkit', 'instamart', 'swiggy', 'zomato', 'dunzo']
    
    np.random.seed(42)
    data = {
        'city': np.random.choice(cities, samples),
        'platform': np.random.choice(platforms, samples),
        'weekly_hours': np.clip(np.random.normal(40, 15, samples), 10, 80),
        'is_safe_zone': np.random.choice([0, 1], samples, p=[0.8, 0.2])
    }
    df = pd.DataFrame(data)
    
    # Calculate target (risk_score) based on synthetic rules to train the ML model
    # Base risks
    base_city_risk = {'mumbai': 0.7, 'delhi': 0.65, 'chennai': 0.55, 'kolkata': 0.6, 'default': 0.45}
    def get_city_risk(c):
        return base_city_risk.get(c, 0.45)
        
    df['risk_score'] = df['city'].apply(get_city_risk)
    
    # More hours = slightly higher risk of incdient
    df['risk_score'] += (df['weekly_hours'] / 80) * 0.15
    
    # Platform risk
    platform_risk = {'zepto': 0.05, 'blinkit': 0.04, 'dunzo': 0.06}
    df['risk_score'] += df['platform'].apply(lambda x: platform_risk.get(x, 0.03))
    
    # Safe zone dramatically reduces risk exactly as requested
    df['risk_score'] -= df['is_safe_zone'] * 0.10 
    
    # Add noise
    df['risk_score'] += np.random.normal(0, 0.02, samples)
    df['risk_score'] = df['risk_score'].clip(0.1, 1.0)
    
    return df

def train_or_load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(CITY_ENCODER_PATH) and os.path.exists(PLATFORM_ENCODER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            city_enc = joblib.load(CITY_ENCODER_PATH)
            plat_enc = joblib.load(PLATFORM_ENCODER_PATH)
            return model, city_enc, plat_enc
        except:
            pass
            
    # Train new
    print("Training new Random Forest Risk Model...")
    df = generate_mock_data()
    
    city_enc = LabelEncoder()
    plat_enc = LabelEncoder()
    
    df['city_encoded'] = city_enc.fit_transform(df['city'])
    df['platform_encoded'] = plat_enc.fit_transform(df['platform'])
    
    X = df[['city_encoded', 'platform_encoded', 'weekly_hours', 'is_safe_zone']]
    y = df['risk_score']
    
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(city_enc, CITY_ENCODER_PATH)
    joblib.dump(plat_enc, PLATFORM_ENCODER_PATH)
    
    return model, city_enc, plat_enc

try:
    risk_model, city_encoder, platform_encoder = train_or_load_model()
except Exception as e:
    print(f"Failed to load ML model: {e}")
    risk_model, city_encoder, platform_encoder = None, None, None

def predict_risk(city: str, platform: str, weekly_hours: float, pin_code: str):
    city = city.lower().strip()
    platform = platform.lower().strip()
    
    # Handle unseen categories gracefully
    if city not in city_encoder.classes_:
        city = city_encoder.classes_[0]  # Fallback
    if platform not in platform_encoder.classes_:
        platform = platform_encoder.classes_[0]
        
    c_enc = city_encoder.transform([city])[0]
    p_enc = platform_encoder.transform([platform])[0]
    is_safe = 1 if str(pin_code) in WATERLOGGING_SAFE_ZONES else 0
    
    X_input = pd.DataFrame([{
        'city_encoded': c_enc,
        'platform_encoded': p_enc,
        'weekly_hours': float(weekly_hours),
        'is_safe_zone': is_safe
    }])
    
    score = risk_model.predict(X_input)[0]
    return float(np.clip(score, 0.05, 1.0)), is_safe
