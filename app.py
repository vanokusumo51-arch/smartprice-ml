from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import json

from database import get_connection

app = Flask(__name__)

CORS(app)

# =====================================
# MACHINE LEARNING MODEL
# =====================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "price_model.pkl")

# Pengamanan: Jika file model.pkl belum ada, server tidak akan langsung crash
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    model = None

FEATURES = [
    "weight", "resoloution", "ppi", "cpu core", "cpu freq",
    "internal mem", "ram", "RearCam", "Front_Cam", "battery", "thickness"
]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model ML belum di-training/tidak ditemukan"}), 500

        data = request.get_json()
        if not data:
            return jsonify({"error": "Data tidak ditemukan"}), 400

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

        input_df = pd.DataFrame([input_data], columns=FEATURES)
        prediction = model.predict(input_df)[0]

        return jsonify({
            "predicted_price": round(float(prediction), 2),
            "status": "success"
        })

    except KeyError as error:
        return jsonify({"error": f"Input tidak lengkap: {error}"}), 400
    except Exception as error:
        return jsonify({"error": str(error)}), 500


# =====================================
# HOME API
# =====================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "SmartPrice-ML API aktif!", "status": "online"})


# =====================================
# GET SMARTPHONES
# =====================================
@app.route("/api/phones", methods=["GET"])
def get_phones():
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM smartphones ORDER BY id DESC")
        rows = cursor.fetchall()

        phones = []
        for row in rows:
            phone = dict(row)
            specs = phone.pop("specs_json", None)
            if isinstance(specs, str):
                specs = json.loads(specs)
            phone["specs"] = specs or {}
            phones.append(phone)

        return jsonify({
            "status": "success",
            "total": len(phones),
            "data": phones
        })
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        if connection:
            connection.close()


# =====================================
# ADD SMARTPHONE
# =====================================
@app.route("/api/phones", methods=["POST"])
def add_phone():
    connection = None
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
            return jsonify({"error": "Nama dan brand wajib diisi"}), 400
        if price <= 0:
            return jsonify({"error": "Harga harus lebih dari 0"}), 400

        connection = get_connection()
        cursor = connection.cursor()

        # Murni SQLite: Menggunakan (?) bukan (%s)
        cursor.execute("""
            INSERT INTO smartphones
            (name, brand, price, image, specs_json)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id
        """, (name, brand, price, image, json.dumps(specs, ensure_ascii=False)))

        phone_id = cursor.fetchone()["id"]
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Smartphone berhasil ditambahkan!",
            "id": phone_id
        }), 201
    except Exception as error:
        if connection:
            connection.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        if connection:
            connection.close()


# =====================================
# DELETE SMARTPHONE
# =====================================
@app.route("/api/phones/<int:phone_id>", methods=["DELETE"])
def delete_phone(phone_id):
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Murni SQLite: Menggunakan (?) bukan (%s)
        cursor.execute("DELETE FROM smartphones WHERE id = ?", (phone_id,))
        deleted = cursor.rowcount
        connection.commit()

        if deleted == 0:
            return jsonify({"status": "error", "message": "Smartphone tidak ditemukan"}), 404

        return jsonify({"status": "success", "message": "Smartphone berhasil dihapus!"}), 200
    except Exception as error:
        if connection:
            connection.rollback()
        return jsonify({"status": "error", "message": str(error)}), 500
    finally:
        if connection:
            connection.close()


# =====================================
# RUN APPLICATION
# =====================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)