/* =========================================
   PHONEPRICE AI - ADMIN PANEL
========================================= */

const API_URL = "https://quintuple-squall-spider.ngrok-free.dev";


// =========================================
// A. MENGAMBIL ELEMENT HTML
// =========================================

const addPhoneForm = document.getElementById("addPhoneForm");
const formMessage = document.getElementById("formMessage");
const submitPhone = document.getElementById("submitPhone");

const totalPhones = document.getElementById("totalPhones");
const totalBrands = document.getElementById("totalBrands");

const apiIndicator = document.getElementById("apiIndicator");
const apiStatus = document.getElementById("apiStatus");
const apiStat = document.getElementById("apiStat");

const phoneTableBody = document.getElementById("phoneTableBody");
const phoneSearch = document.getElementById("phoneSearch");
const phoneBrandFilter = document.getElementById("phoneBrandFilter");
const phoneTableMessage = document.getElementById("phoneTableMessage");
const refreshPhones = document.getElementById("refreshPhones");

let smartphones = [];


// =========================================
// B. FORMAT HARGA
// =========================================

function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(price);
}


// =========================================
// C. CEK KONEKSI API
// =========================================

async function checkAPI() {
    try {
        const response = await fetch(API_URL, {
    headers: { "ngrok-skip-browser-warning": "true" }
});

        if (!response.ok) {
            throw new Error("API tidak merespons");
        }

        const result = await response.json();

        if (result.status !== "online") {
            throw new Error("Status API tidak valid");
        }

        apiIndicator.style.backgroundColor = "#22c55e";
        apiStatus.textContent = "API Online";
        apiStat.textContent = "Online";

        console.log("API berhasil terhubung!");

    } catch (error) {
        apiIndicator.style.backgroundColor = "#ef4444";
        apiStatus.textContent = "API Offline";
        apiStat.textContent = "Offline";

        console.error("API Check Error:", error);
    }
}




// =========================================
// D. MEMUAT DATA SMARTPHONE
// =========================================

async function loadSmartphones() {

    try {

        phoneTableMessage.textContent = "Memuat data...";

        const response = await fetch(`${API_URL}/api/phones`, {
    headers: { "ngrok-skip-browser-warning": "true" }
});
        if (!response.ok) {
            throw new Error("Gagal mengambil data smartphone");
        }

        const result = await response.json();

        smartphones = result.data || [];

        updateDashboard();
        updateBrandFilter();
        displaySmartphones();

    } catch (error) {

        phoneTableMessage.textContent =
            "Gagal memuat data. Periksa Flask API.";

        console.error("Database Error:", error);

    }

}


// =========================================
// E. UPDATE DASHBOARD
// =========================================

function updateDashboard() {

    const brands = [
        ...new Set(smartphones.map(phone => phone.brand))
    ];

    totalPhones.textContent = smartphones.length;
    totalBrands.textContent = brands.length;

}


// =========================================
// F. FILTER BRAND
// =========================================

function updateBrandFilter() {

    const selectedValue = phoneBrandFilter.value;

    const brands = [
        ...new Set(smartphones.map(phone => phone.brand))
    ];

    phoneBrandFilter.innerHTML =
        '<option value="all">Semua Brand</option>';

    brands.forEach(brand => {

        const option = document.createElement("option");

        option.value = brand;
        option.textContent = brand;

        phoneBrandFilter.appendChild(option);

    });

    if (brands.includes(selectedValue)) {
        phoneBrandFilter.value = selectedValue;
    }

}


// =========================================
// G. MENAMPILKAN DATA SMARTPHONE
// =========================================

function displaySmartphones() {

    const keyword = phoneSearch.value.toLowerCase().trim();
    const selectedBrand = phoneBrandFilter.value;

    const filtered = smartphones.filter(phone => {

        const name = (phone.name || "").toLowerCase();
        const brand = (phone.brand || "").toLowerCase();

        const matchesSearch =
            name.includes(keyword) || brand.includes(keyword);

        const matchesBrand =
            selectedBrand === "all" || phone.brand === selectedBrand;

        return matchesSearch && matchesBrand;

    });

    phoneTableBody.innerHTML = "";

    filtered.forEach(phone => {

        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = phone.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = phone.name;

        const brandCell = document.createElement("td");
        brandCell.textContent = phone.brand;

        const priceCell = document.createElement("td");
        priceCell.textContent = formatPrice(phone.price);

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Hapus";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function () {

            deletePhone(phone.id, phone.name);

        });

        actionCell.appendChild(deleteButton);

        row.append(
            idCell,
            nameCell,
            brandCell,
            priceCell,
            actionCell
        );

        phoneTableBody.appendChild(row);

    });

    if (filtered.length === 0) {

        phoneTableMessage.textContent =
            "Tidak ada smartphone yang ditemukan.";

    } else {

        phoneTableMessage.textContent =
            `Menampilkan ${filtered.length} smartphone.`;

    }

}


// =========================================
// H. TAMBAH SMARTPHONE
// =========================================

addPhoneForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    submitPhone.disabled = true;
    submitPhone.textContent = "Menyimpan...";

    formMessage.textContent = "";

    const phoneData = {

        name: document.getElementById("phoneName").value.trim(),

        brand: document.getElementById("phoneBrand").value.trim(),

        price: Number(
            document.getElementById("phonePrice").value
        ),

        image: document.getElementById("phoneImage").value.trim(),

        specs: {

            chipset: document.getElementById("phoneChipset").value.trim(),

            ram: document.getElementById("phoneRam").value.trim(),

            storage: document.getElementById("phoneStorage").value.trim(),

            screen: document.getElementById("phoneScreen").value.trim(),

            resolution: document.getElementById("phoneResolution").value.trim(),

            rearCamera: document.getElementById("phoneCamera").value.trim(),

            frontCamera: document.getElementById("phoneFrontCamera").value.trim(),

            battery: document.getElementById("phoneBattery").value.trim(),

            charging: document.getElementById("phoneCharging").value.trim(),

            os: document.getElementById("phoneOS").value.trim(),

            weight: document.getElementById("phoneWeight").value.trim()

        }

    };

    try {

        const response = await fetch(`${API_URL}/api/phones`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(phoneData)

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || result.message || "Gagal menyimpan data"
            );
        }

        formMessage.textContent =
            "Smartphone berhasil ditambahkan!";

        formMessage.style.color = "#22c55e";

        addPhoneForm.reset();

        await loadSmartphones();

    } catch (error) {

        formMessage.textContent = error.message;
        formMessage.style.color = "#ef4444";

        console.error("Add Phone Error:", error);

    } finally {

        submitPhone.disabled = false;
        submitPhone.textContent = "Simpan Smartphone";

    }

});


// =========================================
// I. HAPUS SMARTPHONE
// =========================================

async function deletePhone(phoneId, phoneName) {

    const confirmation = confirm(
        `Apakah kamu yakin ingin menghapus ${phoneName}?`
    );

    if (!confirmation) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/phones/${phoneId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(
                result.message || "Gagal menghapus smartphone"
            );

        }

        alert("Smartphone berhasil dihapus!");

        await loadSmartphones();

    } catch (error) {

        alert("Gagal menghapus: " + error.message);

        console.error("Delete Error:", error);

    }

}


// =========================================
// J. SEARCH DAN REFRESH
// =========================================

phoneSearch.addEventListener("input", displaySmartphones);

phoneBrandFilter.addEventListener("change", displaySmartphones);

refreshPhones.addEventListener("click", loadSmartphones);


// =========================================
// K. MENJALANKAN ADMIN PANEL
// =========================================

checkAPI();

loadSmartphones();