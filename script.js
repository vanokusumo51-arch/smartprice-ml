/* ==================================================
   PHONEPRICE ML - MAIN JAVASCRIPT
================================================== */


/* ==================================================
   A. SMARTPHONE DATABASE
================================================== */

// Data contoh untuk demonstrasi.
// Harga dan spesifikasi perlu diverifikasi sebelum dipublikasikan.

const API_URL = "https://quintuple-squall-spider.ngrok-free.dev";

let smartphoneDatabase = [];
    
    


/* ==================================================
   B. DATABASE ELEMENTS
================================================== */

const phoneGrid = document.getElementById("phoneGrid");
const searchPhone = document.getElementById("searchPhone");
const brandFilter = document.getElementById("brandFilter");
const databaseNote = document.getElementById("databaseNote");

const phoneModal = document.getElementById("phoneModal");
const detailName = document.getElementById("detailName");
const detailBrand = document.getElementById("detailBrand");
const detailSpecs = document.getElementById("detailSpecs");
const closeModalButton = document.getElementById("closeModal");


/* ==================================================
   C. FORMAT HARGA DATABASE
================================================== */

function formatDatabasePrice(price) {
    const value = Number(price);

    if (!Number.isFinite(value) || value <= 0) {
        return "Harga belum tersedia";
    }

    return value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    });
}


/* ==================================================
   D. MENAMPILKAN KARTU SMARTPHONE
================================================== */

function displayPhones(data) {
    phoneGrid.innerHTML = "";

    if (data.length === 0) {
        phoneGrid.innerHTML = `
            <div class="no-phone">
                <h3>Smartphone Tidak Ditemukan</h3>
                <p>Coba nama atau merek lainnya.</p>
            </div>
        `;

        databaseNote.textContent = "Tidak ada hasil pencarian.";
        return;
    }

    data.forEach(phone => {
        const specs = phone.specs || {};

        const card = document.createElement("article");
        card.className = "phone-card";

        const imageContainer = document.createElement("div");
        imageContainer.className = "phone-image";

        const image = document.createElement("img");
        image.src = phone.image;
        image.alt = phone.name;
        image.loading = "lazy";

        const placeholder = document.createElement("div");
        placeholder.className = "phone-image-placeholder";
        placeholder.textContent = phone.brand.charAt(0);

        image.addEventListener("error", () => {
            image.style.display = "none";
            placeholder.style.display = "grid";
        });

        imageContainer.append(image, placeholder);

        card.innerHTML = `
            <div class="phone-info">

                <span class="phone-brand">
                    ${phone.brand.toUpperCase()}
                </span>

                <h3>${phone.name}</h3>

                <div class="phone-price">
                    <span>Harga Pasar</span>
                    <strong>${formatDatabasePrice(phone.price)}</strong>
                </div>

                <div class="phone-specs">

                    <div class="phone-spec">
                        <span>RAM</span>
                        <strong>${specs.ram || "-"}</strong>
                    </div>

                    <div class="phone-spec">
                        <span>Penyimpanan</span>
                        <strong>${specs.storage || "-"}</strong>
                    </div>

                    <div class="phone-spec">
                        <span>Baterai</span>
                        <strong>${specs.battery || "-"}</strong>
                    </div>

                    <div class="phone-spec">
                        <span>Chipset</span>
                        <strong>${specs.chipset || "-"}</strong>
                    </div>

                </div>

                <button type="button" class="detail-button">
                    Lihat Detail
                </button>

            </div>
        `;

        card.insertBefore(imageContainer, card.firstChild);

        const detailButton = card.querySelector(".detail-button");

        detailButton.addEventListener("click", () => {
            showPhoneDetail(phone.name);
        });

        phoneGrid.appendChild(card);
    });

    databaseNote.textContent =
        `Menampilkan ${data.length} smartphone.`;
}


/* ==================================================
   E. PENCARIAN DAN FILTER
================================================== */

function filterPhones() {
    const keyword = searchPhone.value.toLowerCase().trim();
    const selectedBrand = brandFilter.value;

    const filteredPhones = smartphoneDatabase.filter(phone => {
        const matchesName =
            phone.name.toLowerCase().includes(keyword);

        const matchesBrand =
            phone.brand.toLowerCase().includes(keyword);

        const matchesFilter =
            selectedBrand === "all" ||
            phone.brand === selectedBrand;

        return (matchesName || matchesBrand) && matchesFilter;
    });

    displayPhones(filteredPhones);
}

searchPhone.addEventListener("input", filterPhones);
brandFilter.addEventListener("change", filterPhones);


/* ==================================================
   F. DETAIL SMARTPHONE / MODAL
================================================== */

function showPhoneDetail(phoneName) {
    const phone = smartphoneDatabase.find(
        item => item.name === phoneName
    );

    if (!phone) {
        console.error("Smartphone tidak ditemukan:", phoneName);
        return;
    }

    const specs = phone.specs || {};

    detailName.textContent = phone.name;
    detailBrand.textContent = phone.brand;

    const specList = [
        ["Harga", formatDatabasePrice(phone.price)],
        ["Chipset", specs.chipset],
        ["RAM", specs.ram],
        ["Penyimpanan", specs.storage],
        ["Layar", specs.screen],
        ["Resolusi", specs.resolution],
        ["Kamera Belakang", specs.rearCamera],
        ["Kamera Depan", specs.frontCamera],
        ["Baterai", specs.battery],
        ["Pengisian Daya", specs.charging],
        ["Sistem Operasi", specs.os],
        ["Berat", specs.weight]
    ];

    detailSpecs.innerHTML = "";

    specList.forEach(([label, value]) => {
        const item = document.createElement("div");
        item.className = "spec-item";

        const labelElement = document.createElement("span");
        labelElement.textContent = label;

        const valueElement = document.createElement("strong");
        valueElement.textContent = value || "Belum tersedia";

        item.append(labelElement, valueElement);
        detailSpecs.appendChild(item);
    });

    phoneModal.classList.add("active");
    phoneModal.setAttribute("aria-hidden", "false");
}

function closePhoneDetail() {
    phoneModal.classList.remove("active");
    phoneModal.setAttribute("aria-hidden", "true");
}

closeModalButton.addEventListener("click", closePhoneDetail);

phoneModal.addEventListener("click", event => {
    if (event.target === phoneModal) {
        closePhoneDetail();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closePhoneDetail();
    }
});


/* ==================================================
   G. MENAMPILKAN DATABASE SAAT HALAMAN DIBUKA
================================================== */

async function loadSmartphones() {
    try {
        const response = await fetch(`${API_URL}/api/phones`, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data smartphone");
        }

        const result = await response.json();

        smartphoneDatabase = result.data.map(phone => ({
            ...phone,
            specs: {
                ...phone.specs,
                chipset: phone.specs?.chipset || "-",
                ram: phone.specs?.ram || "-",
                storage: phone.specs?.storage || "-",
                screen: phone.specs?.screen || "-",
                resolution: phone.specs?.resolution || "-",
                rearCamera: phone.specs?.rearCamera || phone.specs?.camera || "-",
                frontCamera: phone.specs?.frontCamera || "-",
                battery: phone.specs?.battery || "-",
                charging: phone.specs?.charging || "-",
                os: phone.specs?.os || "-",
                weight: phone.specs?.weight || "-"
            }
        }));

        displayPhones(smartphoneDatabase);

        console.log("Database smartphone berhasil dimuat!");

    } catch (error) {
        console.error("Gagal memuat database:", error);
        databaseNote.textContent = "Gagal terhubung ke database smartphone.";
    }
}

loadSmartphones().then(() => {
    loadComparePhones();
    displaySmartScores();
});


/* ==================================================
   H. PREDICTION SYSTEM
================================================== */

// Mengambil elemen form prediksi

const predictionForm = document.getElementById("predictionForm");
const predictButton = document.getElementById("predictButton");
const resultSection = document.getElementById("result");
const priceResult = document.getElementById("priceResult");
const specSummary = document.getElementById("specSummary");


// Mengambil 11 fitur dari input HTML

function getPhoneData() {
    return {
        weight: Number(document.getElementById("weight").value),
        resolution: Number(document.getElementById("resolution").value),
        ppi: Number(document.getElementById("ppi").value),
        cpuCore: Number(document.getElementById("cpuCore").value),
        cpuFreq: Number(document.getElementById("cpuFreq").value),
        internalMem: Number(document.getElementById("internalMem").value),
        ram: Number(document.getElementById("ram").value),
        rearCam: Number(document.getElementById("rearCam").value),
        frontCam: Number(document.getElementById("frontCam").value),
        battery: Number(document.getElementById("battery").value),
        thickness: Number(document.getElementById("thickness").value)
    };
}


// Validasi semua input

function validatePhoneData(data) {
    return Object.values(data).every(value =>
        Number.isFinite(value) && value > 0
    );
}


// Format hasil prediksi menjadi Rupiah.
//
// Faktor 600 dipertahankan dari kode lamamu.
// Pastikan faktor ini memang sesuai dengan satuan
// output model Flask yang kamu gunakan.

function formatPredictionPrice(price) {
    const rupiah = price * 750;

    return rupiah.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    });
}


// Membuat ringkasan spesifikasi

function displayPredictionSummary(data) {
    const summary = [
        ["Berat", `${data.weight} gram`],
        ["Ukuran Layar", `${data.resolution} inci`],
        ["Kepadatan Layar", `${data.ppi} PPI`],
        ["CPU Core", `${data.cpuCore} Core`],
        ["Frekuensi CPU", `${data.cpuFreq} GHz`],
        ["RAM", `${data.ram} GB`],
        ["Penyimpanan", `${data.internalMem} GB`],
        ["Kamera Belakang", `${data.rearCam} MP`],
        ["Kamera Depan", `${data.frontCam} MP`],
        ["Baterai", `${data.battery} mAh`],
        ["Ketebalan", `${data.thickness} mm`]
    ];

    specSummary.innerHTML = `
        <h3>Ringkasan Spesifikasi HP</h3>
        <div class="spec-grid">
            ${summary.map(([label, value]) => `
                <div class="spec-item">
                    <span>${label}</span>
                    <strong>${value}</strong>
                </div>
            `).join("")}
        </div>
    `;
}


// Proses prediksi ketika tombol ditekan

predictionForm.addEventListener("submit", async event => {
    event.preventDefault();

    const phoneData = getPhoneData();

    if (!validatePhoneData(phoneData)) {
        alert("Mohon isi semua spesifikasi dengan angka lebih dari 0.");
        return;
    }

    predictButton.disabled = true;
    predictButton.textContent = "Sedang memprediksi...";

    resultSection.hidden = true;

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(phoneData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Prediksi gagal.");
        }

        if (
            typeof result.predicted_price !== "number" ||
            !Number.isFinite(result.predicted_price)
        ) {
            throw new Error("Hasil prediksi tidak valid.");
        }

        priceResult.textContent =
            formatPredictionPrice(result.predicted_price);

        displayPredictionSummary(phoneData);

        resultSection.hidden = false;

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {
        console.error("Prediction Error:", error);

        alert(
            "Prediksi gagal: " + error.message +
            "\n\nPastikan server Flask sedang berjalan."
        );

    } finally {
        predictButton.disabled = false;
        predictButton.textContent = "Prediksi Harga HP";
    }
});

// ===================================
// REKOMENDASI HP BERDASARKAN BUDGET
// ===================================

const budgetInput = document.getElementById("budgetInput");
const recommendButton = document.getElementById("recommendButton");
const budgetResults = document.getElementById("budgetResults");

function displayBudgetRecommendations() {
    const budget = Number(budgetInput.value);

    // Validasi input
    if (!Number.isFinite(budget) || budget <= 0) {
        budgetResults.innerHTML = `
            <div class="budget-message">
                Masukkan budget yang valid terlebih dahulu.
            </div>
        `;
        return;
    }

    // Mencari HP yang harganya tidak melebihi budget
    const recommendations = smartphoneDatabase
        .filter(phone => {
            return Number.isFinite(Number(phone.price)) &&
                   Number(phone.price) > 0 &&
                   Number(phone.price) <= budget;
        })
        // Urutkan dari harga tertinggi ke terendah
        .sort((a, b) => b.price - a.price);

    // Jika tidak ada HP yang sesuai
    if (recommendations.length === 0) {
        budgetResults.innerHTML = `
            <div class="budget-message">
                <h3>Belum ada rekomendasi 😔</h3>
                <p>
                    Maaf, belum ada HP dalam database
                    yang sesuai dengan budget kamu.
                </p>
            </div>
        `;
        return;
    }

    // Menampilkan rekomendasi
    budgetResults.innerHTML = recommendations.map(phone => `
        <div class="budget-card">
            <h3>${phone.name}</h3>

            <p>${phone.brand}</p>

            <div class="budget-price">
                ${formatDatabasePrice(phone.price)}
            </div>

            <p>RAM: ${phone.specs.ram}</p>
            <p>Storage: ${phone.specs.storage}</p>
            <p>Baterai: ${phone.specs.battery}</p>
            <p>Chipset: ${phone.specs.chipset}</p>

            <button
                type="button"
                class="budget-detail-button"
                data-phone="${phone.name}"
            >
                Lihat Detail
            </button>
        </div>
    `).join("");

    // Menghubungkan tombol detail dengan modal
    budgetResults.querySelectorAll(".budget-detail-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                showPhoneDetail(button.dataset.phone);
            });
        });
}

// Event tombol pencarian
recommendButton.addEventListener(
    "click",
    displayBudgetRecommendations
);

// Bisa juga mencari dengan menekan Enter
budgetInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        displayBudgetRecommendations();
    }
});
/* ==========================================
   SMARTPHONE RECOMMENDATION BY USER NEEDS
========================================== */

const needOptions = document.querySelectorAll(".need-option");
const needResults = document.getElementById("needResults");
const needResultHeading = document.getElementById("needResultHeading");
const needResultDescription = document.getElementById("needResultDescription");

// Mengambil angka pertama dari spesifikasi.
// Contoh: "8GB" menjadi 8, "5000mAh" menjadi 5000.
function getSpecNumber(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const match = String(value).match(/\d+(\.\d+)?/);

    return match ? Number(match[0]) : null;
}

// Konfigurasi bobot setiap kebutuhan.
const needWeights = {
    gaming: {
        title: "Gaming",
        description: "Memprioritaskan RAM, penyimpanan, dan kapasitas baterai.",
        weights: {
            ram: 0.45,
            storage: 0.30,
            battery: 0.25
        }
    },

    camera: {
        title: "Fotografi",
        description: "Memprioritaskan resolusi kamera belakang dan depan.",
        weights: {
            rearCamera: 0.70,
            frontCamera: 0.30
        }
    },

    battery: {
        title: "Baterai Awet",
        description: "Memprioritaskan kapasitas baterai.",
        weights: {
            battery: 0.85,
            ram: 0.15
        }
    },

    multitasking: {
        title: "Multitasking",
        description: "Memprioritaskan RAM dan penyimpanan internal.",
        weights: {
            ram: 0.65,
            storage: 0.35
        }
    },

    daily: {
        title: "Penggunaan Sehari-hari",
        description: "Memprioritaskan keseimbangan spesifikasi HP.",
        weights: {
            ram: 0.25,
            storage: 0.25,
            battery: 0.25,
            rearCamera: 0.25
        }
    }
};

// Mengambil spesifikasi numerik dari database.
function getPhoneFeatures(phone) {
    const specs = phone.specs || {};

    return {
        ram: getSpecNumber(specs.ram),
        storage: getSpecNumber(specs.storage),
        battery: getSpecNumber(specs.battery),
        rearCamera: getSpecNumber(specs.rearCamera),
        frontCamera: getSpecNumber(specs.frontCamera)
    };
}

// Menghitung skor kecocokan berdasarkan database.
function calculateNeedScore(phone, config) {
    const features = getPhoneFeatures(phone);

    let totalScore = 0;
    let totalWeight = 0;

    for (const feature in config.weights) {
        const value = features[feature];

        if (value === null || value <= 0) {
            continue;
        }

        const values = smartphoneDatabase
            .map(item => getPhoneFeatures(item)[feature])
            .filter(value => value !== null && value > 0);

        if (values.length === 0) {
            continue;
        }

        const maximum = Math.max(...values);

        // Normalisasi nilai agar dapat dibandingkan.
        const normalizedScore = (value / maximum) * 100;

        const weight = config.weights[feature];

        totalScore += normalizedScore * weight;
        totalWeight += weight;
    }

    if (totalWeight === 0) {
        return 0;
    }

    return Math.round(totalScore / totalWeight);
}

// Menampilkan hasil rekomendasi.
function showNeedRecommendations(need) {
    const config = needWeights[need];

    if (!config) {
        return;
    }

    // Menandai tombol yang dipilih.
    needOptions.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.need === need
        );
    });

    needResultHeading.hidden = false;

    needResultHeading.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    needResultDescription.textContent = config.description;

    // Menghitung skor seluruh HP.
    const recommendations = smartphoneDatabase
        .map(phone => ({
            ...phone,
            needScore: calculateNeedScore(phone, config)
        }))
        .filter(phone => phone.needScore > 0)
        .sort((a, b) => b.needScore - a.needScore);

    if (recommendations.length === 0) {
        needResults.innerHTML = `
            <div class="need-empty">
                <h3>Belum ada rekomendasi</h3>
                <p>
                    Data spesifikasi HP belum cukup
                    untuk kebutuhan ini.
                </p>
            </div>
        `;

        return;
    }

    // Membuat kartu rekomendasi.
    needResults.innerHTML = recommendations.map(phone => `
        <div class="budget-card">

            <div class="budget-image">
                <img
                    src="${phone.image}"
                    alt="${phone.name}"
                    onerror="this.style.display='none'"
                >
            </div>

            <div class="budget-card-content">

                <h3>${phone.name}</h3>

                <p class="budget-brand">
                    ${phone.brand}
                </p>

                <div class="budget-price">
                    ${formatDatabasePrice(phone.price)}
                </div>

                <div class="need-score">
                    Skor kecocokan: ${phone.needScore}/100
                </div>

                <div class="budget-specs">
                    <p>RAM: ${phone.specs.ram || "-"}</p>
                    <p>Storage: ${phone.specs.storage || "-"}</p>
                    <p>Baterai: ${phone.specs.battery || "-"}</p>
                    <p>Chipset: ${phone.specs.chipset || "-"}</p>
                </div>

                <button
                    type="button"
                    class="need-detail-button"
                    data-phone="${phone.name}"
                >
                    Lihat Detail
                </button>

            </div>
        </div>
    `).join("");

    // Menghubungkan tombol dengan modal detail HP.
    needResults
        .querySelectorAll(".need-detail-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                showPhoneDetail(button.dataset.phone);
            });
        });
}

// Event listener untuk setiap pilihan kebutuhan.
needOptions.forEach(button => {
    button.addEventListener("click", () => {
        showNeedRecommendations(button.dataset.need);
    });
});

// ===================================
// COMPARE SMARTPHONE
// ===================================

const phoneSelect1 = document.getElementById("phoneSelect1");
const phoneSelect2 = document.getElementById("phoneSelect2");
const compareButton = document.getElementById("compareButton");
const compareResults = document.getElementById("compareResults");

// Mengisi pilihan HP dari database yang sudah ada
function loadComparePhones() {
    phoneSelect1.innerHTML = '<option value="">Pilih Smartphone</option>';
    phoneSelect2.innerHTML = '<option value="">Pilih Smartphone</option>';

    smartphoneDatabase.forEach((phone, index) => {
        const option1 = document.createElement("option");
        const option2 = document.createElement("option");

        option1.value = index;
        option2.value = index;

        option1.textContent = phone.name;
        option2.textContent = phone.name;

        phoneSelect1.appendChild(option1);
        phoneSelect2.appendChild(option2);
    });
}

// Mengambil angka pertama dari spesifikasi
function getCompareNumber(value) {
    const match = String(value ?? "").match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
}

// Membuat baris perbandingan
function createCompareRow(label, value1, value2, higherIsBetter = true) {
    const number1 = getCompareNumber(value1);
    const number2 = getCompareNumber(value2);

    let class1 = "";
    let class2 = "";

    if (number1 !== null && number2 !== null) {
        if (number1 === number2) {
            class1 = "compare-equal";
            class2 = "compare-equal";
        } else {
            const firstWins = higherIsBetter
                ? number1 > number2
                : number1 < number2;

            class1 = firstWins ? "compare-better" : "";
            class2 = firstWins ? "" : "compare-better";
        }
    }

    return `
        <tr>
            <td>${label}</td>
            <td class="${class1}">${value1 ?? "Belum tersedia"}</td>
            <td class="${class2}">${value2 ?? "Belum tersedia"}</td>
        </tr>
    `;
}

// Membandingkan dua smartphone
function compareSmartphones() {
    const index1 = phoneSelect1.value;
    const index2 = phoneSelect2.value;

    if (index1 === "" || index2 === "") {
        compareResults.innerHTML =
            '<p class="compare-message">Silakan pilih dua smartphone terlebih dahulu.</p>';
        return;
    }

    if (index1 === index2) {
        compareResults.innerHTML =
            '<p class="compare-message">Pilih dua smartphone yang berbeda.</p>';
        return;
    }

    const phone1 = smartphoneDatabase[Number(index1)];
    const phone2 = smartphoneDatabase[Number(index2)];

    const spec1 = phone1.specs;
    const spec2 = phone2.specs;

    compareResults.innerHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Spesifikasi</th>
                    <th>${phone1.name}</th>
                    <th>${phone2.name}</th>
                </tr>
            </thead>

            <tbody>
                ${createCompareRow("Harga", formatDatabasePrice(phone1.price), formatDatabasePrice(phone2.price))}
                ${createCompareRow("Chipset", spec1.chipset, spec2.chipset)}
                ${createCompareRow("RAM", spec1.ram, spec2.ram)}
                ${createCompareRow("Penyimpanan", spec1.storage, spec2.storage)}
                ${createCompareRow("Layar", spec1.screen, spec2.screen)}
                ${createCompareRow("Resolusi", spec1.resolution, spec2.resolution)}
                ${createCompareRow("Kamera Belakang", spec1.rearCamera, spec2.rearCamera)}
                ${createCompareRow("Kamera Depan", spec1.frontCamera, spec2.frontCamera)}
                ${createCompareRow("Baterai", spec1.battery, spec2.battery)}
                ${createCompareRow("Pengisian Daya", spec1.charging, spec2.charging)}
                ${createCompareRow("Sistem Operasi", spec1.os, spec2.os)}
                ${createCompareRow("Berat", spec1.weight, spec2.weight, false)}
            </tbody>
        </table>

        <p class="compare-message">
            <span class="compare-better">Hijau</span> menunjukkan angka yang lebih unggul.
            <span class="compare-equal">Kuning</span> menunjukkan angka yang sama.
        </p>
    `;
}

compareButton.addEventListener("click", compareSmartphones);

// Mengisi pilihan ketika halaman selesai dimuat

// ===================================
// SMART SCORE SYSTEM
// ===================================

const smartScoreGrid = document.getElementById("smartScoreGrid");
const smartScoreSort = document.getElementById("smartScoreSort");

// Mengambil angka dari spesifikasi
function getSmartScoreNumber(value) {
    if (value === null || value === undefined) return null;

    const match = String(value).match(/\d+(\.\d+)?/);

    return match ? Number(match[0]) : null;
}

// Mengambil nilai spesifikasi HP
function getSmartScoreFeatures(phone) {
    const specs = phone.specs;

    return {
        ram: getSmartScoreNumber(specs.ram),
        storage: getSmartScoreNumber(specs.storage),
        battery: getSmartScoreNumber(specs.battery),
        rearCamera: getSmartScoreNumber(specs.rearCamera),
        frontCamera: getSmartScoreNumber(specs.frontCamera),
        cpuCores: getSmartScoreNumber(specs.cpuCores),
        cpuFrequency: getSmartScoreNumber(specs.cpuFrequency)
    };
}

// Menghitung skor berdasarkan nilai dan batas database
function normalizeSmartScore(value, min, max) {
    if (value === null) return null;

    // Jika semua HP memiliki nilai yang sama
    if (max === min) return 100;

    return ((value - min) / (max - min)) * 100;
}

// Mengambil batas minimum dan maksimum
function getSmartScoreRange(featureName) {
    const values = smartphoneDatabase
        .map(phone => getSmartScoreFeatures(phone)[featureName])
        .filter(value => value !== null);

    if (values.length === 0) return null;

    return {
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

// Menghitung kategori
function calculateSmartCategory(phone, features, weights) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const feature in weights) {
        const value = features[feature];
        const range = getSmartScoreRange(feature);

        if (value === null || !range) continue;

        const score = normalizeSmartScore(
            value,
            range.min,
            range.max
        );

        if (score === null) continue;

        totalScore += score * weights[feature];
        totalWeight += weights[feature];
    }

    if (totalWeight === 0) return null;

    return Math.round(totalScore / totalWeight);
}

// Menghitung seluruh kategori
function calculateSmartScore(phone) {
    const features = getSmartScoreFeatures(phone);

    const categories = {
        performance: calculateSmartCategory(phone, features, {
            ram: 0.50,
            cpuCores: 0.20,
            cpuFrequency: 0.30
        }),

        camera: calculateSmartCategory(phone, features, {
            rearCamera: 0.70,
            frontCamera: 0.30
        }),

        battery: calculateSmartCategory(phone, features, {
            battery: 1
        }),

        storage: calculateSmartCategory(phone, features, {
            storage: 1
        })
    };

    const availableCategories = Object.values(categories)
        .filter(score => score !== null);

    const overall = availableCategories.length
        ? Math.round(
            availableCategories.reduce((sum, score) => sum + score, 0)
            / availableCategories.length
        )
        : 0;

    return {
        overall,
        categories
    };
}

// Menampilkan kartu Smart Score
function displaySmartScores() {
    const sortedPhones = smartphoneDatabase.map(phone => ({
        phone,
        score: calculateSmartScore(phone)
    }));

    if (smartScoreSort.value === "highest") {
        sortedPhones.sort((a, b) =>
            b.score.overall - a.score.overall
        );
    } else {
        sortedPhones.sort((a, b) =>
            a.score.overall - b.score.overall
        );
    }

    smartScoreGrid.innerHTML = "";

    sortedPhones.forEach(item => {
        const phone = item.phone;
        const score = item.score;

        const categories = [
            ["Performa", score.categories.performance],
            ["Kamera", score.categories.camera],
            ["Baterai", score.categories.battery],
            ["Penyimpanan", score.categories.storage]
        ];

        const categoryHTML = categories.map(([name, value]) => `
            <div class="smart-score-detail">
                <span>${name}</span>
                <strong>${value === null ? "Data tidak tersedia" : value + "/100"}</strong>
            </div>
        `).join("");

        const card = document.createElement("div");
        card.className = "smart-score-card";

        card.innerHTML = `
            <h3>${phone.name}</h3>

            <div class="smart-score-number">
                ${score.overall}<span>/100</span>
            </div>

            <div class="smart-score-bar">
                <div class="smart-score-progress"
                     style="width: ${score.overall}%">
                </div>
            </div>

            <div class="smart-score-details">
                ${categoryHTML}
            </div>

            <div class="smart-score-price">
                ${formatDatabasePrice(phone.price)}
            </div>
        `;

        smartScoreGrid.appendChild(card);
    });

    if (sortedPhones.length === 0) {
        smartScoreGrid.innerHTML = `
            <p class="smart-score-empty">
                Belum ada data smartphone.
            </p>
        `;
    }
}

// Mengubah urutan skor
smartScoreSort.addEventListener("change", displaySmartScores);
