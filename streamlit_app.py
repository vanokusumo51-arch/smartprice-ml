import streamlit as st

st.set_page_config(
    page_title="SmartPrice-ML",
    page_icon="📱",
    layout="wide",
    initial_sidebar_state="expanded"
)

# SIDEBAR
st.sidebar.title("📱 SmartPrice-ML")
st.sidebar.caption("Smartphone Price Intelligence")

menu = st.sidebar.radio(
    "MENU UTAMA",
    [
        "Dashboard",
        "Prediksi Harga",
        "Katalog Smartphone",
        "Admin Panel"
    ]
)

# DASHBOARD
if menu == "Dashboard":
    st.title("Dashboard")
    st.write("Selamat datang di SmartPrice-ML!")

    col1, col2, col3 = st.columns(3)

    col1.metric("Total Smartphone", "0")
    col2.metric("Prediksi Dilakukan", "0")
    col3.metric("Status Sistem", "Online")

    st.divider()

    st.subheader("Tentang SmartPrice-ML")
    st.write(
        "Platform prediksi harga smartphone "
        "berbasis Machine Learning."
    )

# PREDIKSI
elif menu == "Prediksi Harga":
    st.title("🤖 Prediksi Harga")
    st.info("Fitur prediksi akan segera diintegrasikan.")

# KATALOG
elif menu == "Katalog Smartphone":
    st.title("📱 Katalog Smartphone")
    st.info("Katalog akan terhubung ke Supabase.")

# ADMIN
elif menu == "Admin Panel":
    st.title("⚙️ Admin Panel")
    st.info("Pengelolaan data smartphone.")