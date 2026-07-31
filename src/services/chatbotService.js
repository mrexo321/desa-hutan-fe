import environment from "../config/environment";

const API_BASE = environment.CHATBOT_API_URL;
const CHATBOT_ID_STORAGE_KEY = "desa_hutan_chatbot_id";

// ============================================================
// KNOWLEDGE BASE LENGKAP APLIKASI DESA HUTAN
// Digunakan sebagai system prompt agar chatbot memahami konteks
// ============================================================
const APP_KNOWLEDGE_BASE = `
# SISTEM INFORMASI PEMETAAN PROFIL DESA HUTAN
## Deskripsi Sistem
Aplikasi ini adalah Sistem Informasi berbasis web untuk **Pemetaan Profil Desa Hutan** di Indonesia.
Dikembangkan untuk mendukung program **Perhutanan Sosial** Kementerian Lingkungan Hidup dan Kehutanan (KLHK).
Sistem ini digunakan oleh operator, analis, dan administrator untuk memantau, mengelola, dan menganalisis data desa-desa yang berada di dalam dan sekitar kawasan hutan.

---

## FITUR-FITUR UTAMA APLIKASI

### 1. DASHBOARD (Halaman Utama)
Halaman utama yang menampilkan:
- **Peta Interaktif (Mapbox GL)**: Peta Indonesia yang dapat di-zoom, diklik, dan difilter
  - Layer WMS Wilayah Hutan (dari GeoServer)
  - Layer WMS Wilayah Desa (dari GeoServer)
  - Layer WMS Desa PSN (dari GeoServer, bisa filter per tahun)
  - Popup detail spasial saat klik titik di peta (menampilkan nama desa, luas, kawasan hutan, status interaksi)
  - Pencarian desa/kecamatan di peta
  - Pilihan base map: Satelit, Jalan Default, Tema Terang, Tema Gelap
  - Mode fullscreen
- **Visualisasi Matriks IDM (Indeks Desa Membangun)**:
  - Grafik Pie Chart status desa: MANDIRI, MAJU, BERKEMBANG, TERTINGGAL, SANGAT TERTINGGAL
  - Bar Chart distribusi desa per kawasan
  - Filter per tahun dan filter hanya PSN
  - Drill-down modal untuk melihat daftar desa per status
- **Ringkasan Analisis Spasial**: statistik singkat dari analisis wilayah
- **Filter Wilayah**: filter per Provinsi, Kabupaten, Kecamatan

**Status IDM (Indeks Desa Membangun)**:
- MANDIRI: Desa paling maju, skor IDM tertinggi (≥ 0.8155)
- MAJU: Desa berkembang pesat (0.7072 - 0.8154)
- BERKEMBANG: Desa sedang berkembang (0.5989 - 0.7071)
- TERTINGGAL: Desa yang masih tertinggal (0.4907 - 0.5988)
- SANGAT TERTINGGAL: Desa paling butuh perhatian (< 0.4907)

---

### 2. DESA HUTAN
Menampilkan **daftar desa-desa** yang memiliki interaksi dengan kawasan hutan.
Data mencakup:
- Nama desa, kecamatan, kabupaten, provinsi
- Luas desa (Ha)
- Kawasan hutan yang beririsan
- Status interaksi (Mayoritas, Sebagian Besar, Irisan Kecil)
- Kode Kemendagri desa

---

### 3. PERFORMA DESA (Halaman Performa Desa Hutan)
Fitur untuk mengelola dan menganalisis **data kalkulasi performa desa**.
- Menampilkan tabel hasil kalkulasi dengan **kolom dinamis** sesuai formula yang dipilih
- Setiap formula memiliki indikator berbeda (kolom berbeda)
- Nilai tiap indikator per desa ditampilkan
- **Download Template Excel**: Unduh template data kosong untuk diisi
- **Upload Excel**: Import data desa via file Excel (.xlsx) untuk proses kalkulasi otomatis (background job)
- Filter berdasarkan Formula dan Tahun
- Pagination 20 data per halaman

**Cara menggunakan Performa Desa**:
1. Pilih Formula dari dropdown
2. Tabel otomatis muncul dengan kolom sesuai formula
3. Klik "Download Template" untuk download template Excel
4. Isi template dengan data desa
5. Klik "Upload Excel" → pilih formula + tahun + file → klik Upload
6. Sistem memproses di background (dapat waktu beberapa menit)

---

### 4. DESA PSN (Program Strategis Nasional)
Mengelola data **Desa-desa yang termasuk Program Strategis Nasional (PSN)**.
- Daftar desa PSN per periode/tahun
- Filter per Provinsi, Kabupaten, Kecamatan
- Download template Excel PSN
- Import data PSN via Excel
- Tampilkan di peta (layer PSN di dashboard)

---

### 5. INDIKATOR
Modul master data untuk **Indikator Penilaian Desa**.
Terdiri dari 3 sub-menu:

#### a) Indikator Utama (Master Indikator Utama)
- Daftar indikator utama penilaian desa hutan
- CRUD: tambah, edit, hapus indikator
- Setiap indikator memiliki nama, kode, dan kategori

#### b) Indikator Perhitungan / Formula (Master Indikator Perhitungan)
- Formula/rumus untuk menghitung nilai desa
- Setiap formula terdiri dari kumpulan indikator utama
- Digunakan sebagai dasar kalkulasi di Performa Desa
- CRUD formula

#### c) Tahun Indikator Perhitungan
- Manajemen tahun untuk kalkulasi indikator
- Tambah tahun baru, edit, hapus
- Tahun ini digunakan saat upload data Excel performa

---

### 6. KLASIFIKASI
Mengelola **klasifikasi/kategori desa** berdasarkan skor/nilai.

#### a) Klasifikasi Hutan (Master Klasifikasi Hutan)
- Jenis-jenis kawasan hutan: Hutan Produksi, Hutan Lindung, Taman Nasional, dll.
- CRUD klasifikasi hutan

#### b) Klasifikasi Desa (Master Klasifikasi Desa)
- Kategori desa berdasarkan rentang nilai (nilaiMin - nilaiMax)
- Setiap kategori memiliki nama dan warna representasi
- Contoh: Sangat Baik (90-100), Baik (75-89), Cukup (60-74), dll.
- CRUD klasifikasi desa

---

### 7. WILAYAH
Mengelola **data wilayah desa** yang terdaftar di sistem.
- Daftar desa dengan info lengkap: nama, kecamatan, kabupaten, kode kemendagri
- Upload geometri desa (shp/geojson)
- Tambah, edit, hapus data desa

---

### 8. MASTER WILAYAH
Manajemen data **wilayah administrasi** hierarki:
- **Provinsi**: 38 Provinsi Indonesia
- **Kabupaten/Kota**: berdasarkan provinsi
- **Kecamatan**: berdasarkan kabupaten
- CRUD untuk masing-masing level wilayah

---

### 9. MASTER POTENSI
Manajemen data potensi ekonomi desa.
- Jenis-jenis potensi yang ada di desa
- CRUD data potensi

---

### 10. MANAJEMEN USER
(Khusus role dengan izin user:read/create/update/delete)
- Daftar pengguna sistem
- Tambah user baru
- Edit profil user
- Assign role ke user
- Hapus user

---

### 11. MANAJEMEN ROLE
(Khusus role dengan izin role:read/create/update/delete)
- Daftar role yang ada di sistem
- Buat role baru
- Edit role
- Assign permission ke role
- Hapus role

---

### 12. SITE SETTINGS
(Khusus role dengan izin site:read/update)
Pengaturan tampilan landing page/homepage:
- **Hero Section**: judul, sub-judul, background image hero
- **Profil Desa Hutan**: judul, deskripsi, logo
- **Features**: judul dan deskripsi fitur (Peta, Infografis, Data Desa)
- **General**: logo situs, nama situs

---

## DATA STRUKTUR PENTING

### Detail Desa (dari peta atau klik desa):
- \`nama\`: Nama desa
- \`kodeKemendagri\`: Kode unik desa dari Kemendagri
- \`kecamatan\`, \`kabupaten\`, \`provinsi\`: Hierarki wilayah
- \`luas_desa_ha\`: Luas total desa dalam hektare
- \`ringkasanInteraksi\`:
  - \`totalLuasIrisanHa\`: Total luas yang beririsan dengan hutan (Ha)
  - \`totalPersenIrisan\`: Persentase desa yang masuk kawasan hutan (%)
  - \`totalHutan\`: Jumlah kawasan hutan yang beririsan
  - \`klasifikasi\`: Mayoritas / Sebagian Besar / Irisan Kecil
- \`detailHutan\`: Array detail per kawasan hutan:
  - \`fungsiKawasan.nama\`: Nama fungsi kawasan (Hutan Produksi, HL, TN, dll.)
  - \`fungsiKawasan.kode\`: Kode kawasan
  - \`jenisInteraksi\`: Tipe interaksi (dalam_kawasan, beririsan, luar_kawasan)
  - \`luasIrisanHa\`: Luas irisan (Ha)
  - \`persenIrisan\`: Persentase irisan (%)
  - \`klasifikasi\`: mayoritas / sebagian_besar / irisan_kecil

### Matriks IDM (dari Dashboard Visualisasi):
- Data per status: jumlah desa MANDIRI, MAJU, BERKEMBANG, TERTINGGAL, SANGAT TERTINGGAL
- Bisa difilter: hanya desa PSN atau semua desa
- Bisa drill-down: klik status → lihat daftar desa per status

---

## ALUR KERJA UMUM

### Cara Input Data Performa Desa:
1. Pastikan sudah ada Formula di menu Indikator > Indikator Perhitungan
2. Pastikan sudah ada Tahun di menu Indikator > Tahun Indikator Perhitungan
3. Buka menu Performa Desa
4. Pilih Formula → klik "Download Template"
5. Isi file Excel dengan data nilai desa
6. Klik "Upload Excel" → pilih formula, tahun, dan file
7. Submit → sistem proses di background

### Cara Tambah Desa PSN:
1. Buka menu Desa PSN
2. Download template Excel
3. Isi data desa PSN
4. Upload via tombol Import Excel
5. Pilih periode/tahun

### Cara Melihat Status IDM Desa di Dashboard:
1. Buka Dashboard
2. Scroll ke bagian Visualisasi Matriks
3. Pilih tahun
4. Toggle "Hanya PSN" jika ingin filter desa PSN saja
5. Klik slice pada Pie Chart untuk drill-down detail desa

---

## ROLES & PERMISSIONS

Sistem menggunakan Role-Based Access Control (RBAC):
- **Super Admin**: Akses ke semua fitur
- **Admin**: Akses ke kebanyakan fitur kecuali beberapa pengaturan sensitif
- **Operator**: Akses terbatas, biasanya hanya input data
- **Viewer**: Hanya bisa melihat data

Permission penting:
- \`user:read/create/update/delete\`: Manajemen User
- \`role:read/create/update/delete\`: Manajemen Role
- \`role_permission:assign\`: Assign permission ke role
- \`user_role:assign\`: Assign role ke user
- \`site:read/update\`: Site Settings

---

## INFORMASI TEKNIS (untuk referensi)
- Frontend: React + Vite, TailwindCSS
- Peta: Mapbox GL JS (react-map-gl)
- GeoServer: Untuk WMS layer hutan, desa, PSN
- State Management: Redux Toolkit
- Data Fetching: TanStack React Query
- Backend Auth: JWT dengan refresh token
- Session timeout: 30 menit inaktivitas (ada warning 2 menit sebelum expired)

---

## PERTANYAAN YANG SERING DITANYAKAN (FAQ)

**Q: Bagaimana cara login?**
A: Buka halaman /login, masukkan username dan password. Jika menggunakan E-Portal SSO, klik tombol SSO login.

**Q: Sesi saya habis, apa yang harus dilakukan?**
A: Saat muncul warning "Sesi akan habis", klik "Perpanjang Sesi". Jika sudah expired, login ulang.

**Q: Data di peta tidak muncul?**
A: Pastikan layer sudah diaktifkan dengan tombol toggle di toolbar peta. Periksa koneksi internet dan GeoServer.

**Q: Upload Excel gagal?**
A: Pastikan format file sesuai template, formula dan tahun sudah dipilih, dan ukuran file tidak terlalu besar.

**Q: Tidak bisa akses menu tertentu?**
A: Menu terproteksi memerlukan permission khusus. Hubungi Admin untuk penambahan role/permission.

**Q: Bagaimana cara melihat detail desa di peta?**
A: Klik area di peta → popup muncul dengan detail spasial desa tersebut. Atau gunakan pencarian desa di atas peta.

**Q: Apa itu PSN?**
A: Program Strategis Nasional (PSN) adalah program pemerintah untuk pembangunan infrastruktur dan pemberdayaan masyarakat di desa-desa tertentu, termasuk yang berada di kawasan hutan.

**Q: Apa perbedaan Indikator Utama dan Formula/Indikator Perhitungan?**
A: Indikator Utama adalah indikator individual (contoh: Akses Air Bersih, Akses Listrik). Formula/Indikator Perhitungan adalah kumpulan dari beberapa indikator utama yang digunakan untuk menghitung nilai total desa.
`;

/**
 * System prompt lengkap dengan knowledge base aplikasi
 */
const buildSystemPrompt = (pageContext = "") => {
  return `Kamu adalah **Asisten AI resmi** dari Sistem Informasi Pemetaan Profil Desa Hutan.

## PERAN KAMU
Kamu adalah asisten cerdas yang memahami secara mendalam seluruh fitur, alur kerja, dan data dalam aplikasi ini. Bantu pengguna dengan:
1. Menjawab pertanyaan tentang fitur dan cara penggunaan aplikasi
2. Menjelaskan konsep-konsep terkait Desa Hutan, Perhutanan Sosial, dan IDM
3. Memandu pengguna langkah demi langkah saat mereka kebingungan
4. Menganalisis dokumen yang diupload user secara mendalam dan akurat
5. Menjelaskan data yang sedang ditampilkan di layar mereka

## RUANG LINGKUP APLIKASI
Aplikasi ini adalah **Sistem Informasi Pemetaan Profil Desa Hutan** untuk mendukung program **Perhutanan Sosial** KLHK.
Topik yang relevan meliputi: IDM, performa desa, analisis spasial, kawasan hutan, PSN, KAK proyek, laporan pemerintah, sistem informasi desa, GIS/pemetaan, administrasi wilayah, dan dokumen terkait pembangunan desa/hutan.

Tolak HANYA pertanyaan yang benar-benar tidak relevan (resep masakan, tips fashion, soal matematika murni, dll.)

## KONTEKS HALAMAN SAAT INI
${pageContext || "Pengguna berada di halaman aplikasi Desa Hutan."}

## PENGETAHUAN LENGKAP APLIKASI
${APP_KNOWLEDGE_BASE}

## ATURAN PENTING
1. **ANALISIS DOKUMEN**: Jika ada dokumen yang diupload, analisis secara LENGKAP dan MENDALAM. Percayai bahwa dokumen yang diupload user adalah relevan.
2. **KONTEKSTUAL**: Gunakan "Konteks Halaman Saat Ini" untuk memberikan jawaban yang lebih relevan dan spesifik.
3. **BAHASA**: Selalu gunakan Bahasa Indonesia yang ramah, jelas, dan profesional.
4. **FORMAT**: Gunakan heading, poin bernomor, dan bullet point untuk keterbacaan.
5. **JUJUR**: Jika kamu tidak tahu jawabannya dengan pasti, katakan dengan jujur dan arahkan ke admin sistem.
6. **EMOJI**: Gunakan emoji yang relevan (🌿 🗺️ 📊 📋 ✅ 📌) untuk membuat jawaban lebih mudah dibaca.`;
};


/**
 * Mendapatkan atau membuat chatbot ID
 * Prioritas: env var → localStorage → buat baru
 */
export const getOrCreateChatbotId = async () => {
  // 1. Cek environment variable dulu
  if (environment.CHATBOT_ID && environment.CHATBOT_ID.trim() !== "") {
    return environment.CHATBOT_ID.trim();
  }

  // 2. Cek localStorage (sudah pernah dibuat sebelumnya)
  const storedId = localStorage.getItem(CHATBOT_ID_STORAGE_KEY);
  if (storedId) {
    // Jalankan update system prompt secara background agar database selalu sync dengan file js terbaru
    fetch(`${API_BASE}/chatbots/${storedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Asisten Desa Hutan",
        system_prompt: buildSystemPrompt(),
        model_name: "gpt-4o-mini",
      }),
    }).catch(err => console.error("Gagal sinkronisasi system prompt:", err));

    return storedId;
  }

  // 3. Buat chatbot baru via API dengan system prompt lengkap
  const response = await fetch(`${API_BASE}/chatbots/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Asisten Desa Hutan",
      system_prompt: buildSystemPrompt(),
      model_name: "gpt-4o-mini",
    }),
  });

  if (!response.ok) {
    throw new Error(`Gagal membuat chatbot: ${response.statusText}`);
  }

  const data = await response.json();
  const newId = data.id;

  // Simpan ke localStorage agar tidak perlu buat ulang
  localStorage.setItem(CHATBOT_ID_STORAGE_KEY, newId);

  return newId;
};

/**
 * Mengirim pesan ke chatbot dan mendapatkan jawaban
 * @param {string} chatbotId - UUID chatbot
 * @param {string} question - Pertanyaan dari user
 * @param {Array<[string, string]>} chatHistory - Riwayat chat [[user_msg, bot_msg], ...]
 * @param {string} pageContext - Konteks halaman yang sedang dibuka user
 * @returns {Promise<{question: string, answer: string}>}
 */
export const sendMessage = async (chatbotId, question, chatHistory = [], pageContext = "", activeDocument = null) => {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: question,
      chat_history: chatHistory,
      page_context: pageContext,
      active_document: activeDocument || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Hapus SEMUA dokumen dari vector store chatbot ini
 * Dipanggil saat reset agar dokumen lama benar-benar terhapus dari database
 * @param {string} chatbotId - UUID chatbot
 */
export const clearChatbotDocuments = async (chatbotId) => {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/documents`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Gagal hapus dokumen: ${response.status}`);
  }
  return await response.json();
};

/**
 * Health check untuk memastikan backend chatbot berjalan
 */
export const checkChatbotHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Mendapatkan konteks halaman berdasarkan URL path dan judul
 * Digunakan untuk inject info halaman ke pertanyaan
 */
export const getPageContext = (pathname, additionalData = null) => {
  const routeMap = {
    "/": "Landing Page / Beranda aplikasi",
    "/dashboard": "Dashboard Utama — menampilkan peta interaktif Indonesia, visualisasi matriks IDM, dan ringkasan analisis spasial desa hutan",
    "/dashboard/desa-hutan": "Halaman Desa Hutan — daftar desa yang berinteraksi dengan kawasan hutan",
    "/dashboard/performa-desa": "Halaman Performa Desa — tabel kalkulasi nilai indikator desa, upload/download Excel",
    "/dashboard/performa-desa/edit": "Halaman Edit Performa Desa",
    "/dashboard/potensi-desa": "Halaman Potensi Desa — data potensi ekonomi desa",
    "/dashboard/desa-psn": "Halaman Desa PSN — daftar desa Program Strategis Nasional",
    "/dashboard/indikator": "Halaman Indikator — master data indikator utama, formula perhitungan, dan tahun indikator",
    "/dashboard/indikator-perhitungan": "Halaman Indikator Perhitungan — formula/rumus kalkulasi nilai desa",
    "/dashboard/tahun-indikator-perhitungan": "Halaman Tahun Indikator Perhitungan — manajemen tahun untuk kalkulasi",
    "/dashboard/klasifikasi": "Halaman Klasifikasi — master klasifikasi hutan dan klasifikasi desa berdasarkan nilai",
    "/dashboard/wilayah": "Halaman Wilayah — daftar dan manajemen data wilayah desa",
    "/dashboard/master-wilayah": "Halaman Master Wilayah — manajemen data Provinsi, Kabupaten, Kecamatan",
    "/dashboard/master-potensi": "Halaman Master Potensi — manajemen jenis potensi desa",
    "/dashboard/manajemen-user": "Halaman Manajemen User — kelola akun pengguna dan assign role",
    "/dashboard/manajemen-role": "Halaman Manajemen Role — kelola role dan permission pengguna",
    "/dashboard/site-settings": "Halaman Site Settings — pengaturan tampilan landing page",
    "/dashboard/ai-asisten": "Halaman AI Asisten — upload dokumen dan analisis menggunakan AI, tanya jawab berdasarkan isi dokumen yang diupload",
    "/map": "Halaman Peta — tampilan peta full-screen desa hutan",
    "/infografis": "Halaman Infografis — visualisasi data statistik desa hutan",
    "/about-us": "Halaman Tentang Kami",
    "/login": "Halaman Login",
  };

  // Cari route yang cocok (termasuk dynamic routes)
  let context = routeMap[pathname];
  if (!context) {
    // Handle dynamic routes
    if (pathname.startsWith("/dashboard/provinsi/")) {
      const provinceName = decodeURIComponent(pathname.split("/").pop());
      context = `Halaman Detail Provinsi: ${provinceName} — menampilkan daftar desa dan analisis spasial provinsi tersebut`;
    } else if (pathname.startsWith("/desa-detail/")) {
      context = "Halaman Detail Desa — informasi lengkap desa: luas, kawasan hutan yang beririsan, status interaksi, dan rincian per kawasan";
    } else if (pathname.includes("/tambah") || pathname.includes("/create")) {
      context = `Halaman Tambah Data di ${pathname}`;
    } else if (pathname.includes("/edit")) {
      context = `Halaman Edit Data di ${pathname}`;
    }
  }

  let fullContext = context || `Halaman ${pathname}`;

  // Tambahkan data tambahan jika ada (misalnya nama desa yang sedang dilihat)
  if (additionalData) {
    fullContext += ` | Data aktif: ${additionalData}`;
  }

  return fullContext;
};

/**
 * Suggested questions berdasarkan halaman aktif
 */
export const getSuggestedQuestions = (pathname) => {
  const suggestions = {
    "/dashboard": [
      "Apa arti status IDM MANDIRI?",
      "Bagaimana cara mengaktifkan layer hutan di peta?",
      "Apa itu filter PSN di visualisasi?",
    ],
    "/dashboard/performa-desa": [
      "Bagaimana cara upload data Excel?",
      "Bagaimana cara download template?",
      "Apa itu Formula dalam Performa Desa?",
    ],
    "/dashboard/desa-psn": [
      "Apa itu Desa PSN?",
      "Bagaimana cara import data PSN?",
      "Bagaimana cara filter desa per provinsi?",
    ],
    "/dashboard/indikator": [
      "Apa perbedaan Indikator Utama dan Formula?",
      "Bagaimana cara membuat formula baru?",
      "Bagaimana cara menambah tahun indikator?",
    ],
    "/dashboard/klasifikasi": [
      "Apa perbedaan Klasifikasi Hutan dan Klasifikasi Desa?",
      "Bagaimana cara tambah klasifikasi desa?",
      "Apa itu nilaiMin dan nilaiMax?",
    ],
    "/dashboard/manajemen-user": [
      "Bagaimana cara tambah user baru?",
      "Bagaimana cara assign role ke user?",
      "Apa saja permission yang tersedia?",
    ],
    "/dashboard/ai-asisten": [
      "Apa yang bisa saya tanyakan dari dokumen ini?",
      "Buat ringkasan dokumen yang saya upload",
      "Apa poin-poin penting dari dokumen ini?",
    ],
    "/dashboard/site-settings": [
      "Bagaimana cara ubah logo aplikasi?",
      "Bagaimana cara ganti gambar hero?",
      "Apa saja yang bisa diubah di Site Settings?",
    ],
    default: [
      "Apa itu Desa Hutan?",
      "Bagaimana cara input data performa?",
      "Apa itu status IDM?",
    ],
  };

  return suggestions[pathname] || suggestions.default;
};

/**
 * Upload dokumen (PDF/DOCX) ke knowledge base chatbot
 * Backend akan mengindeks dokumen dan chatbot bisa menjawab berdasarkan isinya
 * @param {string} chatbotId - UUID chatbot
 * @param {File} file - File object untuk diupload
 * @returns {Promise<Object>} - Response dari backend
 */
export const uploadDocument = async (chatbotId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
      errorData.message ||
      `Upload gagal: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Reset chatbot ID dari localStorage
 * Berguna saat ingin membuat chatbot baru dengan system prompt terbaru
 */
export const resetChatbotId = () => {
  localStorage.removeItem(CHATBOT_ID_STORAGE_KEY);
};
