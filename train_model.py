import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. Membaca dataset
data = pd.read_csv("../dataset/Cellphone.csv")

print("Dataset berhasil dibaca!")
print("Jumlah data:", data.shape)

# 2. Menentukan fitur
features = [
    "weight",
    "resoloution",
    "ppi",
    "cpu core",
    "cpu freq",
    "internal mem",
    "ram",
    "RearCam",
    "Front_Cam",
    "battery",
    "thickness"
]

X = data[features]
y = data["Price"]

# 3. Membagi data training dan testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# 4. Membuat model
model = ExtraTreesRegressor(
    n_estimators=200,
    random_state=42
)

# 5. Melatih model
model.fit(X_train, y_train)

# 6. Menguji model
predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\n===== HASIL EVALUASI MODEL =====")
print("MAE:", round(mae, 2))
print("MSE:", round(mse, 2))
print("R2 Score:", round(r2, 4))

# 7. Menyimpan model
joblib.dump(model, "price_model.pkl")

print("\nModel berhasil disimpan!")