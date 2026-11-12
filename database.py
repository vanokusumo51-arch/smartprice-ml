import sqlite3
import os

# Memaksa Python menggunakan jalur mutlak (Absolute Path) 
# agar selalu membaca file database di folder yang sama dengan skrip ini.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_NAME = os.path.join(BASE_DIR, "phoneprice.db")

def get_connection():
    try:
        conn = sqlite3.connect(DATABASE_NAME, check_same_thread=False)
        conn.row_factory = sqlite3.Row 
        return conn
    except sqlite3.Error as e:
        print(f"Error saat menghubungi database: {e}")
        return None