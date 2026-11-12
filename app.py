from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import sqlite3
import json
from database import get_connection

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Memuat model Machine Learning
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "price_model.pkl")

model = joblib.load(MODEL_PATH)

# Urutan fitur harus sama dengan saat training
FEATURES = [
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

# Menerima permintaan prediksi
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Data tidak ditemukan"}), 400

        # Mengubah nama field frontend ke nama kolom dataset
        input_data = {
            "weight": data["weight"],
            "resoloution": data["resolution"],
            "ppi": data["ppi"],
            "cpu core": data["cpuCore"],
            "cpu freq": data["cpuFreq"],
            "internal mem": data["internalMem"],
            "ram": data["ram"],
            "RearCam": data["rearCam"],
            "Front_Cam": data["frontCam"],
            "battery": data["battery"],
            "thickness": data["thickness"]
        }

        # Membuat DataFrame
        input_df = pd.DataFrame([input_data], columns=FEATURES)

        # Prediksi harga
        prediction = model.predict(input_df)[0]

        return jsonify({
            "predicted_price": round(float(prediction), 2),
            "status": "success"
        })

    except KeyError as error:
        return jsonify({
            "error": f"Input tidak lengkap: {error}"
        }), 400

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "PhonePrice AI API aktif!",
        "status": "online"
    })

# ==============================
# SMARTPHONE DATABASE API
# ==============================

@app.route("/api/phones", methods=["GET"])
def get_phones():
    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM smartphones ORDER BY id DESC")
        rows = cursor.fetchall()

        phones = []

        for row in rows:
            phone = dict(row)
            phone["specs"] = json.loads(phone.pop("specs_json") or "{}")
            phones.append(phone)

        connection.close()

        return jsonify({
            "status": "success",
            "total": len(phones),
            "data": phones
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500

# ==============================
# ADD SMARTPHONE API
# ==============================

@app.route("/api/phones", methods=["POST"])
def add_phone():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Data tidak ditemukan"}), 400

        name = str(data.get("name", "")).strip()
        brand = str(data.get("brand", "")).strip()
        image = str(data.get("image", "")).strip()
        specs = data.get("specs", {})
        price = float(data.get("price", 0))

        if not name or not brand:
            return jsonify({
                "error": "Nama dan brand wajib diisi"
            }), 400

        if price <= 0:
            return jsonify({
                "error": "Harga harus lebih dari 0"
            }), 400

        if not isinstance(specs, dict):
            return jsonify({
                "error": "Format spesifikasi tidak valid"
            }), 400

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO smartphones
            (name, brand, price, image, specs_json)
            VALUES (?, ?, ?, ?, ?)
        """, (
            name,
            brand,
            price,
            image,
            json.dumps(specs, ensure_ascii=False)
        ))

        phone_id = cursor.lastrowid

        connection.commit()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Smartphone berhasil ditambahkan!",
            "id": phone_id
        }), 201

    except (ValueError, TypeError):
        return jsonify({
            "error": "Format harga atau data tidak valid"
        }), 400

    except Exception as error:
        return jsonify({"error": str(error)}), 500

@app.route("/api/phones/<int:phone_id>", methods=["DELETE"])
def delete_phone(phone_id):

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM smartphones WHERE id = ?",
            (phone_id,)
        )

        deleted = cursor.rowcount

        connection.commit()
        connection.close()

        if deleted == 0:
            return jsonify({
                "status": "error",
                "message": "Smartphone tidak ditemukan"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Smartphone berhasil dihapus!"
        }), 200

    except Exception as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )