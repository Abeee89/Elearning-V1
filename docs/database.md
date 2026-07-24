# Dokumentasi Teknis Basis Data
## Platform Pembelajaran Interaktif Dasar Kelistrikan dan Elektronika

**Jenis Dokumen:** Software Design Document (SDD) — Bagian Basis Data
**Versi:** 1.0
**Status:** Draft untuk Implementasi

---

## 1. Pendahuluan

### 1.1 Tujuan Pembuatan Basis Data

Basis data ini dirancang untuk menjadi fondasi penyimpanan data bagi sebuah platform pembelajaran daring (e-learning) yang berfokus pada materi dasar kelistrikan dan elektronika. Tujuan utamanya adalah menyediakan struktur data yang mampu menampung empat kebutuhan inti secara bersamaan: (1) pengelolaan pengguna dengan dua peran berbeda (siswa dan guru), (2) penyampaian materi belajar berjenjang beserta simulasi interaktif, (3) proses asesmen dan evaluasi capaian belajar, serta (4) integrasi kecerdasan buatan (AI) sebagai asisten virtual dan mesin evaluasi otomatis.

Basis data bukan sekadar tempat menyimpan data, melainkan representasi dari aturan bisnis sistem. Setiap tabel dan relasi yang dirancang mencerminkan bagaimana siswa belajar, bagaimana guru memantau, dan bagaimana AI ikut ambil bagian dalam proses tersebut.

### 1.2 Fungsi ERD dalam Pengembangan Sistem

Entity Relationship Diagram (ERD) berfungsi sebagai peta cetak biru (blueprint) yang menerjemahkan kebutuhan fungsional aplikasi ke dalam struktur data formal. ERD membantu tim pengembang (frontend, backend, maupun tim yang menggunakan bantuan AI coding agent) untuk:

- Memahami entitas apa saja yang ada dalam sistem dan bagaimana entitas tersebut saling terhubung.
- Menghindari duplikasi data dan inkonsistensi struktur sejak tahap perancangan, sebelum kode program ditulis.
- Menjadi acuan tunggal (single source of truth) ketika beberapa pihak mengerjakan modul yang berbeda secara paralel.
- Mempermudah proses migrasi skema (schema migration) di kemudian hari karena relasi antar tabel sudah terdefinisi dengan jelas.

### 1.3 Gambaran Umum Sistem

Sistem yang dibangun adalah platform pembelajaran berbasis web dengan teknologi Next.js sebagai kerangka kerja aplikasi dan PostgreSQL (di-hosting melalui layanan Neon) sebagai basis data. Terdapat dua jenis akun pengguna: **siswa**, yang dapat mengakses seluruh materi, simulasi, asesmen, dan evaluasi; serta **guru**, yang dapat memantau progres dan hasil evaluasi seluruh siswa dalam kelas yang diampunya.

Secara fungsional, sistem terbagi menjadi lima modul besar yang saling terhubung melalui basis data:

1. **Modul Materi** — penyampaian bahan ajar dalam bentuk bab dan sub-bab (PDF, video, atau teks penjelasan).
2. **Modul Simulasi Interaktif** — kalkulator resistor, simulasi rangkaian listrik, dan sandbox kelistrikan.
3. **Modul Asesmen** — ujian formatif yang wajib diselesaikan setiap sub-bab materi.
4. **Modul Evaluasi AI** — analisis kekuatan, kelemahan, dan rekomendasi belajar yang dihasilkan oleh Large Language Model (LLM) melalui Openrouter.
5. **Modul Chatbot** — asisten virtual berbasis AI yang dapat diakses baik oleh siswa maupun guru.

---

## 2. Arsitektur Basis Data

### 2.1 Pendekatan Perancangan yang Digunakan

Perancangan basis data ini menggunakan pendekatan **model relasional (relational model)** dengan basis data PostgreSQL. Pendekatan ini dipilih karena beberapa alasan:

- Data dalam sistem bersifat sangat terstruktur dan memiliki hubungan yang jelas antar entitas (misalnya siswa mengikuti kelas, kelas memiliki materi, materi memiliki asesmen).
- Kebutuhan akan **integritas referensial** (referential integrity) sangat tinggi, misalnya jawaban ujian tidak boleh ada tanpa soal, dan soal tidak boleh ada tanpa asesmen induknya.
- PostgreSQL mendukung tipe data JSON/JSONB, sehingga konfigurasi simulasi (`config`) atau pilihan jawaban (`options`) yang bersifat semi-terstruktur tetap dapat disimpan tanpa mengorbankan disiplin skema relasional pada data inti.
- Layanan Neon menyediakan PostgreSQL serverless dengan tingkatan gratis (free tier) yang cukup untuk kebutuhan pengembangan dan skala awal produksi.

Perancangan mengikuti prinsip **normalisasi** (dijelaskan lebih rinci pada Bagian 7) agar tidak terjadi duplikasi data, serta menerapkan pemisahan tanggung jawab antar tabel (single responsibility per table) agar sistem mudah dikembangkan lebih lanjut.

### 2.2 Jenis Relasi yang Digunakan

Basis data ini menggunakan kombinasi tiga jenis relasi:

| Jenis Relasi | Contoh Penerapan |
|---|---|
| One-to-Many (1:N) | Satu `chapters` memiliki banyak `subchapters`; satu `assessments` memiliki banyak `questions` |
| Many-to-Many (M:N), diimplementasikan melalui tabel penghubung | `users` (siswa) dan `classes` terhubung melalui tabel `class_enrollments` |
| One-to-One (opsional, 1:0..1) | Satu `subchapters` memiliki paling banyak satu `assessments` terkait |

Tidak ada relasi Many-to-Many yang diimplementasikan secara langsung (native), karena PostgreSQL sebagai basis data relasional murni mengharuskan setiap hubungan M:N direalisasikan melalui **tabel penghubung (junction/associative table)**, seperti yang diterapkan pada `class_enrollments`.

### 2.3 Alasan Pemilihan Struktur Basis Data

Struktur basis data dipecah menjadi 14 tabel dengan domain fungsi yang jelas, alih-alih menggabungkan banyak informasi ke dalam sedikit tabel besar. Alasannya:

- **Skalabilitas fitur** — setiap fitur di navbar (materi, simulasi, asesmen, evaluasi) memiliki tabel domainnya sendiri, sehingga penambahan fitur baru tidak memerlukan perombakan tabel yang sudah ada.
- **Kemudahan query analitik** — pemisahan `assessment_attempts` dan `attempt_answers` memungkinkan perhitungan skor, statistik butir soal, dan pola kesalahan siswa dilakukan tanpa memindai data yang tidak relevan.
- **Auditabilitas** — riwayat interaksi (percakapan chatbot, riwayat pengerjaan ujian, riwayat evaluasi) tersimpan sebagai baris data historis, bukan menimpa (overwrite) data lama, sehingga jejak belajar siswa dapat ditelusuri kembali.
- **Dukungan AI native** — tabel `chat_sessions`, `chat_messages`, dan `evaluations` dirancang khusus untuk menyimpan input maupun output dari pemanggilan LLM melalui Openrouter, tanpa mencampurnya dengan data akademik inti.

---

## 3. Penjelasan Setiap Entitas (Dokumentasi Tabel)

### 3.1 Tabel `users`

**Deskripsi**
Tabel ini menyimpan seluruh akun pengguna sistem, baik siswa maupun guru, dalam satu struktur tunggal yang dibedakan melalui kolom `role`.

**Tujuan**
Menyatukan mekanisme autentikasi untuk dua peran pengguna yang berbeda hak aksesnya, sehingga proses login, manajemen sesi, dan otorisasi cukup ditangani oleh satu modul autentikasi, tanpa duplikasi logika untuk masing-masing peran.

**Primary Key**
`id` (UUID) — bertindak sebagai pengenal unik setiap pengguna. Penggunaan UUID (bukan angka berurutan/auto-increment) dipilih agar identitas pengguna tidak mudah ditebak dan aman digunakan sebagai referensi lintas tabel maupun pada URL publik.

**Foreign Key**
Tabel ini tidak memiliki foreign key karena berada di posisi tabel induk (parent/master table) — tabel lain seperti `classes`, `class_enrollments`, `assessment_attempts`, `evaluations`, `learning_progress`, dan `chat_sessions` yang merujuk ke tabel ini.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik pengguna |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Alamat email, digunakan sebagai kredensial login |
| password_hash | VARCHAR(255) | NOT NULL | Kata sandi yang telah dienkripsi (hash), tidak pernah disimpan dalam bentuk teks biasa |
| full_name | VARCHAR(150) | NOT NULL | Nama lengkap pengguna untuk ditampilkan di antarmuka |
| role | VARCHAR(20) | NOT NULL, CHECK (role IN ('student','teacher')) | Peran pengguna yang menentukan hak akses fitur |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu akun dibuat |

---

### 3.2 Tabel `classes`

**Deskripsi**
Menyimpan data kelas yang dibuat oleh guru, sebagai wadah pengelompokan siswa untuk keperluan pemantauan progres belajar secara kolektif.

**Tujuan**
Memenuhi kebutuhan bahwa siswa dapat "ditugaskan ke dalam kelas untuk memudahkan penyaringan (filtering)", serta menjadi dasar bagi guru untuk melihat evaluasi dan progres seluruh siswa dalam satu kelas tertentu.

**Primary Key**
`id` (UUID) — identitas unik setiap kelas.

**Foreign Key**
`teacher_id` merujuk ke `users.id`, membatasi bahwa hanya pengguna dengan peran guru yang secara logis boleh menjadi pemilik/pengampu kelas (validasi peran dilakukan di lapisan aplikasi/backend, bukan murni oleh constraint basis data).

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik kelas |
| name | VARCHAR(100) | NOT NULL | Nama kelas, contoh: "Kelas X TITL 1" |
| teacher_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | Guru pengampu kelas |
| description | TEXT | NULLABLE | Deskripsi tambahan mengenai kelas |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu kelas dibuat |

---

### 3.3 Tabel `class_enrollments`

**Deskripsi**
Tabel penghubung (junction table) yang merealisasikan relasi many-to-many antara siswa dan kelas.

**Tujuan**
Tanpa tabel ini, relasi banyak-ke-banyak antara `users` (siswa) dan `classes` tidak dapat direpresentasikan dalam model relasional murni. Tabel ini juga menyimpan metadata tambahan berupa waktu pendaftaran siswa ke kelas tersebut.

**Primary Key**
`id` (UUID) — identitas unik setiap baris pendaftaran.

**Foreign Key**
`class_id` merujuk ke `classes.id`, dan `student_id` merujuk ke `users.id`. Kombinasi keduanya sebaiknya diberi **unique constraint** agar satu siswa tidak dapat terdaftar dua kali pada kelas yang sama.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik pendaftaran |
| class_id | UUID | FOREIGN KEY REFERENCES classes(id), NOT NULL | Kelas yang diikuti |
| student_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | Siswa yang mendaftar |
| enrolled_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu siswa terdaftar ke kelas |

*Catatan: disarankan menambahkan `UNIQUE (class_id, student_id)` untuk mencegah duplikasi pendaftaran.*

---

### 3.4 Tabel `chapters`

**Deskripsi**
Menyimpan daftar bab utama materi pembelajaran, misalnya "Zat dan Atom", "Jenis Bahan Listrik", "Besaran dan Karakteristik Listrik Dasar", hingga "Rangkaian Aplikasi Elektronika dan Optik Dasar".

**Tujuan**
Menjadi kerangka tingkat pertama dari struktur materi berjenjang, sesuai kebutuhan bahwa materi harus disajikan dalam bentuk bab yang kemudian dipecah menjadi sub-bab.

**Primary Key**
`id` (UUID) — identitas unik bab.

**Foreign Key**
Tidak ada, karena `chapters` merupakan tabel induk dari `subchapters`.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik bab |
| title | VARCHAR(200) | NOT NULL | Judul bab |
| order_index | INTEGER | NOT NULL | Urutan tampil bab dalam daftar materi |

---

### 3.5 Tabel `subchapters`

**Deskripsi**
Menyimpan sub-bab yang merupakan pecahan lebih rinci dari sebuah bab, berisi konten belajar aktual berupa PDF, video, atau penjelasan singkat berbasis teks.

**Tujuan**
Memenuhi kebutuhan struktur materi dua tingkat (bab → sub-bab) sekaligus menjadi titik acuan (anchor) bagi fitur lain seperti simulasi, asesmen, progres belajar, dan sesi chatbot yang bersifat kontekstual terhadap materi tertentu.

**Primary Key**
`id` (UUID) — identitas unik sub-bab.

**Foreign Key**
`chapter_id` merujuk ke `chapters.id`, menyatakan sub-bab tersebut merupakan bagian dari bab mana.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik sub-bab |
| chapter_id | UUID | FOREIGN KEY REFERENCES chapters(id), NOT NULL | Bab induk dari sub-bab ini |
| title | VARCHAR(200) | NOT NULL | Judul sub-bab |
| order_index | INTEGER | NOT NULL | Urutan tampil sub-bab dalam bab |
| content_type | VARCHAR(20) | NOT NULL, CHECK (content_type IN ('pdf','video','text')) | Jenis konten materi |
| content_url | VARCHAR(500) | NULLABLE | Tautan berkas PDF atau video |
| content_body | TEXT | NULLABLE | Isi penjelasan singkat berbasis teks |

---

### 3.6 Tabel `simulations`

**Deskripsi**
Menyimpan definisi simulasi interaktif, seperti kalkulator resistor, simulasi rangkaian seri/paralel/campuran, serta sandbox kelistrikan bebas.

**Tujuan**
Mengakomodasi kebutuhan bahwa simulasi dapat terikat pada materi tertentu (misalnya simulasi rangkaian seri muncul di sub-bab rangkaian seri) maupun berdiri bebas (sandbox kelistrikan yang tidak terikat sub-bab manapun).

**Primary Key**
`id` (UUID) — identitas unik simulasi.

**Foreign Key**
`subchapter_id` merujuk ke `subchapters.id`, bersifat **nullable** karena sandbox kelistrikan tidak wajib terhubung ke sub-bab tertentu.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik simulasi |
| subchapter_id | UUID | FOREIGN KEY REFERENCES subchapters(id), NULLABLE | Sub-bab tempat simulasi ini digunakan (kosong jika sandbox bebas) |
| type | VARCHAR(50) | NOT NULL | Jenis simulasi, contoh: `resistor_calculator`, `series_circuit`, `sandbox` |
| title | VARCHAR(150) | NOT NULL | Nama tampilan simulasi |
| config | JSONB | NULLABLE | Parameter konfigurasi simulasi (nilai komponen, topologi rangkaian, dsb.) |

---

### 3.7 Tabel `assessments`

**Deskripsi**
Menyimpan ujian formatif yang wajib dikerjakan siswa setelah menyelesaikan sebuah sub-bab materi.

**Tujuan**
Memenuhi persyaratan bisnis bahwa "setiap materi pembelajaran yang telah diselesaikan harus disertai ujian formatif untuk mengukur pemahaman siswa."

**Primary Key**
`id` (UUID) — identitas unik asesmen.

**Foreign Key**
`subchapter_id` merujuk ke `subchapters.id`, menyatakan asesmen tersebut merupakan penilaian atas sub-bab mana.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik asesmen |
| subchapter_id | UUID | FOREIGN KEY REFERENCES subchapters(id), NOT NULL, UNIQUE | Sub-bab yang dinilai oleh asesmen ini |
| title | VARCHAR(150) | NOT NULL | Judul asesmen |
| passing_score | INTEGER | NOT NULL, DEFAULT 70 | Nilai batas minimum kelulusan |

*Catatan: constraint `UNIQUE` pada `subchapter_id` merealisasikan relasi one-to-one antara sub-bab dan asesmennya.*

---

### 3.8 Tabel `questions`

**Deskripsi**
Menyimpan butir-butir soal yang menjadi bagian dari sebuah asesmen.

**Tujuan**
Memisahkan definisi soal dari definisi asesmen agar satu asesmen dapat memiliki banyak soal, dan setiap soal dapat dianalisis secara individual (misalnya soal mana yang paling sering salah dijawab).

**Primary Key**
`id` (UUID) — identitas unik soal.

**Foreign Key**
`assessment_id` merujuk ke `assessments.id`, menyatakan soal tersebut bagian dari asesmen mana.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik soal |
| assessment_id | UUID | FOREIGN KEY REFERENCES assessments(id), NOT NULL | Asesmen induk dari soal ini |
| question_text | TEXT | NOT NULL | Isi teks pertanyaan |
| question_type | VARCHAR(30) | NOT NULL, CHECK (question_type IN ('multiple_choice','true_false','essay')) | Jenis soal |
| options | JSONB | NULLABLE | Daftar pilihan jawaban (untuk soal pilihan ganda) |
| correct_answer | VARCHAR(255) | NOT NULL | Kunci jawaban benar |

---

### 3.9 Tabel `assessment_attempts`

**Deskripsi**
Mencatat setiap kali seorang siswa mengerjakan sebuah asesmen, termasuk skor akhir dan waktu pengerjaan.

**Tujuan**
Menjadi dasar perhitungan progres, syarat aktivasi fitur evaluasi ("aktif setelah siswa menyelesaikan minimal satu asesmen"), serta bahan analisis AI untuk menyusun evaluasi.

**Primary Key**
`id` (UUID) — identitas unik percobaan pengerjaan.

**Foreign Key**
`student_id` merujuk ke `users.id`, `assessment_id` merujuk ke `assessments.id`.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik percobaan |
| student_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | Siswa yang mengerjakan |
| assessment_id | UUID | FOREIGN KEY REFERENCES assessments(id), NOT NULL | Asesmen yang dikerjakan |
| score | INTEGER | NULLABLE | Skor akhir hasil pengerjaan |
| started_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu mulai mengerjakan |
| completed_at | TIMESTAMP | NULLABLE | Waktu selesai mengerjakan |

---

### 3.10 Tabel `attempt_answers`

**Deskripsi**
Menyimpan jawaban rinci siswa untuk setiap soal dalam satu percobaan pengerjaan asesmen.

**Tujuan**
Memberikan data granular (per butir soal) yang diperlukan AI untuk menyusun analisis kekuatan dan kelemahan siswa secara spesifik, bukan hanya berdasarkan skor akhir semata.

**Primary Key**
`id` (UUID) — identitas unik jawaban.

**Foreign Key**
`attempt_id` merujuk ke `assessment_attempts.id`, `question_id` merujuk ke `questions.id`.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik jawaban |
| attempt_id | UUID | FOREIGN KEY REFERENCES assessment_attempts(id), NOT NULL | Percobaan pengerjaan terkait |
| question_id | UUID | FOREIGN KEY REFERENCES questions(id), NOT NULL | Soal yang dijawab |
| student_answer | VARCHAR(255) | NULLABLE | Jawaban yang dipilih/ditulis siswa |
| is_correct | BOOLEAN | NOT NULL, DEFAULT false | Status kebenaran jawaban |

---

### 3.11 Tabel `evaluations`

**Deskripsi**
Menyimpan hasil evaluasi belajar siswa yang dihasilkan oleh AI (melalui Openrouter), berupa saran, analisis kekuatan/kelemahan, dan rekomendasi materi lanjutan.

**Tujuan**
Memenuhi kebutuhan fitur evaluasi yang aktif setelah siswa menyelesaikan minimal satu asesmen, di mana AI memberikan analisis personal berbasis riwayat pengerjaan siswa.

**Primary Key**
`id` (UUID) — identitas unik evaluasi.

**Foreign Key**
`student_id` merujuk ke `users.id`.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik evaluasi |
| student_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | Siswa yang dievaluasi |
| strengths | TEXT | NULLABLE | Kekuatan siswa hasil analisis AI |
| weaknesses | TEXT | NULLABLE | Kelemahan siswa hasil analisis AI |
| recommendations | TEXT | NULLABLE | Rekomendasi materi lanjutan dari AI |
| generated_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu evaluasi dihasilkan |

---

### 3.12 Tabel `learning_progress`

**Deskripsi**
Mencatat status penyelesaian belajar siswa untuk setiap sub-bab, seperti belum dimulai, sedang berlangsung, atau selesai.

**Tujuan**
Menjadi sumber data utama bagi guru untuk memantau progres belajar siswa dalam kelasnya, serta bagi siswa untuk melihat sejauh mana materi telah diselesaikan.

**Primary Key**
`id` (UUID) — identitas unik catatan progres.

**Foreign Key**
`student_id` merujuk ke `users.id`, `subchapter_id` merujuk ke `subchapters.id`.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik catatan progres |
| student_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | Siswa yang dipantau |
| subchapter_id | UUID | FOREIGN KEY REFERENCES subchapters(id), NOT NULL | Sub-bab yang dipantau |
| status | VARCHAR(20) | NOT NULL, CHECK (status IN ('not_started','in_progress','completed')), DEFAULT 'not_started' | Status penyelesaian materi |
| completed_at | TIMESTAMP | NULLABLE | Waktu materi selesai dipelajari |

*Catatan: disarankan `UNIQUE (student_id, subchapter_id)` agar satu siswa hanya memiliki satu catatan progres per sub-bab.*

---

### 3.13 Tabel `chat_sessions`

**Deskripsi**
Menyimpan sesi percakapan antara pengguna (siswa atau guru) dengan chatbot AI.

**Tujuan**
Mengelompokkan pesan-pesan chatbot ke dalam sesi yang jelas, serta menyimpan konteks materi (jika ada) sehingga jawaban AI dapat disesuaikan dengan sub-bab yang sedang dipelajari pengguna.

**Primary Key**
`id` (UUID) — identitas unik sesi percakapan.

**Foreign Key**
`user_id` merujuk ke `users.id`, `subchapter_id` merujuk ke `subchapters.id` (nullable, karena chatbot dapat digunakan tanpa konteks materi tertentu).

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik sesi |
| user_id | UUID | FOREIGN KEY REFERENCES users(id), NOT NULL | Pengguna yang memulai sesi |
| subchapter_id | UUID | FOREIGN KEY REFERENCES subchapters(id), NULLABLE | Konteks materi terkait sesi (jika ada) |
| started_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu sesi dimulai |

---

### 3.14 Tabel `chat_messages`

**Deskripsi**
Menyimpan setiap pesan individu dalam sebuah sesi percakapan chatbot, baik dari pengguna maupun balasan AI.

**Tujuan**
Menjadi riwayat lengkap percakapan yang dapat ditampilkan kembali ke pengguna, serta dikirim ulang sebagai konteks (conversation history) pada pemanggilan API Openrouter berikutnya.

**Primary Key**
`id` (UUID) — identitas unik pesan.

**Foreign Key**
`session_id` merujuk ke `chat_sessions.id`.

**List Field**

| Field | Tipe Data | Constraint | Deskripsi |
|---|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identitas unik pesan |
| session_id | UUID | FOREIGN KEY REFERENCES chat_sessions(id), NOT NULL | Sesi tempat pesan ini berada |
| sender | VARCHAR(10) | NOT NULL, CHECK (sender IN ('user','ai')) | Pengirim pesan |
| message_text | TEXT | NOT NULL | Isi pesan |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu pesan dikirim |

---

## 4. Penjelasan Relasi

#### USERS → CLASSES
**Jenis Relasi:** One-to-Many
**Kardinalitas:** 1 users : N classes
**Penjelasan:** Satu pengguna berperan sebagai guru dapat membuat dan mengampu banyak kelas, namun setiap kelas hanya dimiliki oleh satu guru.
**Contoh Implementasi:** `SELECT * FROM classes WHERE teacher_id = :guru_id;`

#### USERS → CLASS_ENROLLMENTS, CLASSES → CLASS_ENROLLMENTS
**Jenis Relasi:** Many-to-Many (direalisasikan melalui tabel penghubung)
**Kardinalitas:** N users : N classes, melalui M class_enrollments
**Penjelasan:** Seorang siswa dapat terdaftar di lebih dari satu kelas (misalnya jika ada kelas remedial), dan satu kelas dapat menampung banyak siswa. Tabel `class_enrollments` menjadi penengah relasi ini.
**Contoh Implementasi:** `SELECT u.full_name FROM users u JOIN class_enrollments ce ON u.id = ce.student_id WHERE ce.class_id = :kelas_id;`

#### CHAPTERS → SUBCHAPTERS
**Jenis Relasi:** One-to-Many
**Kardinalitas:** 1 chapters : N subchapters
**Penjelasan:** Satu bab dipecah menjadi banyak sub-bab, namun setiap sub-bab hanya dimiliki oleh satu bab induk.
**Contoh Implementasi:** `SELECT * FROM subchapters WHERE chapter_id = :bab_id ORDER BY order_index;`

#### SUBCHAPTERS → SIMULATIONS
**Jenis Relasi:** One-to-Many (opsional/nullable)
**Kardinalitas:** 1 subchapters : N simulations (atau 0 jika simulasi bersifat sandbox bebas)
**Penjelasan:** Satu sub-bab dapat memiliki banyak simulasi pendukung (misalnya sub-bab rangkaian seri memiliki simulasi rangkaian seri dan kalkulator resistor sekaligus), sementara sandbox kelistrikan tidak terikat sub-bab manapun.
**Contoh Implementasi:** `SELECT * FROM simulations WHERE subchapter_id = :subbab_id;`

#### SUBCHAPTERS → ASSESSMENTS
**Jenis Relasi:** One-to-One
**Kardinalitas:** 1 subchapters : 0..1 assessments
**Penjelasan:** Setiap sub-bab paling banyak memiliki satu asesmen formatif, sesuai aturan bisnis bahwa setiap materi yang selesai dipelajari harus disertai satu ujian formatif.
**Contoh Implementasi:** `SELECT * FROM assessments WHERE subchapter_id = :subbab_id;`

#### ASSESSMENTS → QUESTIONS
**Jenis Relasi:** One-to-Many
**Kardinalitas:** 1 assessments : N questions
**Penjelasan:** Satu asesmen terdiri atas banyak butir soal, namun setiap soal hanya menjadi bagian dari satu asesmen.
**Contoh Implementasi:** `SELECT * FROM questions WHERE assessment_id = :asesmen_id;`

#### USERS → ASSESSMENT_ATTEMPTS, ASSESSMENTS → ASSESSMENT_ATTEMPTS
**Jenis Relasi:** One-to-Many (dari dua sisi)
**Kardinalitas:** 1 users : N assessment_attempts, 1 assessments : N assessment_attempts
**Penjelasan:** Seorang siswa dapat mengerjakan satu asesmen lebih dari satu kali (mengulang untuk memperbaiki nilai), dan satu asesmen dapat dikerjakan oleh banyak siswa yang berbeda.
**Contoh Implementasi:** `SELECT * FROM assessment_attempts WHERE student_id = :siswa_id AND assessment_id = :asesmen_id ORDER BY started_at DESC;`

#### ASSESSMENT_ATTEMPTS → ATTEMPT_ANSWERS, QUESTIONS → ATTEMPT_ANSWERS
**Jenis Relasi:** One-to-Many (dari dua sisi)
**Kardinalitas:** 1 assessment_attempts : N attempt_answers, 1 questions : N attempt_answers
**Penjelasan:** Satu percobaan pengerjaan menghasilkan banyak baris jawaban (satu baris per soal), dan satu soal dapat dijawab pada banyak percobaan pengerjaan yang berbeda oleh siswa yang berbeda pula.
**Contoh Implementasi:** `SELECT * FROM attempt_answers WHERE attempt_id = :percobaan_id;`

#### USERS → EVALUATIONS
**Jenis Relasi:** One-to-Many
**Kardinalitas:** 1 users : N evaluations
**Penjelasan:** Seorang siswa dapat menerima banyak evaluasi AI dari waktu ke waktu seiring bertambahnya riwayat asesmen yang dikerjakan, sehingga evaluasi bersifat historis, bukan menimpa evaluasi sebelumnya.
**Contoh Implementasi:** `SELECT * FROM evaluations WHERE student_id = :siswa_id ORDER BY generated_at DESC LIMIT 1;`

#### USERS → LEARNING_PROGRESS, SUBCHAPTERS → LEARNING_PROGRESS
**Jenis Relasi:** One-to-Many (dari dua sisi)
**Kardinalitas:** 1 users : N learning_progress, 1 subchapters : N learning_progress
**Penjelasan:** Satu siswa memiliki banyak catatan progres (satu per sub-bab yang pernah diakses), dan satu sub-bab dipantau progresnya oleh banyak siswa berbeda.
**Contoh Implementasi:** `SELECT status, count(*) FROM learning_progress WHERE subchapter_id = :subbab_id GROUP BY status;`

#### USERS → CHAT_SESSIONS, SUBCHAPTERS → CHAT_SESSIONS
**Jenis Relasi:** One-to-Many (dari dua sisi)
**Kardinalitas:** 1 users : N chat_sessions, 1 subchapters : N chat_sessions
**Penjelasan:** Seorang pengguna dapat membuka banyak sesi chatbot pada waktu berbeda, dan satu sub-bab dapat menjadi konteks bagi banyak sesi chatbot dari pengguna yang berbeda.
**Contoh Implementasi:** `SELECT * FROM chat_sessions WHERE user_id = :user_id ORDER BY started_at DESC;`

#### CHAT_SESSIONS → CHAT_MESSAGES
**Jenis Relasi:** One-to-Many
**Kardinalitas:** 1 chat_sessions : N chat_messages
**Penjelasan:** Satu sesi percakapan terdiri atas banyak pesan bolak-balik antara pengguna dan AI.
**Contoh Implementasi:** `SELECT * FROM chat_messages WHERE session_id = :sesi_id ORDER BY created_at ASC;`

---

## 5. Alur Data dalam Basis Data (Data Flow)

Alur data dalam sistem dapat digambarkan melalui perjalanan seorang siswa dari mulai masuk ke sistem hingga menerima evaluasi belajar:

1. **Autentikasi** — siswa login, sistem memverifikasi kredensial pada tabel `users` dan menetapkan sesi berdasarkan `role`.
2. **Penempatan kelas** — sistem memeriksa `class_enrollments` untuk mengetahui kelas mana yang diikuti siswa, sehingga guru dapat memfilter data siswa tersebut nantinya.
3. **Akses materi** — siswa membuka `chapters` lalu memilih `subchapters` tertentu; sistem mencatat atau memperbarui status pada `learning_progress` menjadi `in_progress`.
4. **Penggunaan simulasi** — jika sub-bab memiliki `simulations` terkait, siswa dapat berinteraksi dengannya; interaksi ini murni di sisi klien dan tidak selalu menulis data baru, kecuali jika sistem ingin mencatat riwayat penggunaan simulasi di kemudian hari.
5. **Penggunaan chatbot** — kapan pun siswa membutuhkan bantuan, sistem membuat baris baru di `chat_sessions` (jika sesi belum ada) dan menyimpan setiap pertukaran pesan ke `chat_messages`, sambil mengirim riwayat sesi tersebut ke Openrouter sebagai konteks.
6. **Pengerjaan asesmen** — setelah materi dipelajari, siswa mengerjakan `assessments` terkait; sistem membuat satu baris di `assessment_attempts`, lalu mencatat setiap jawaban di `attempt_answers`, dan pada akhirnya menghitung `score` serta menandai `completed_at`.
7. **Pembaruan progres** — begitu asesmen selesai dengan skor mencukupi, `learning_progress` untuk sub-bab tersebut diperbarui menjadi `completed`.
8. **Pembuatan evaluasi AI** — begitu terdapat minimal satu `assessment_attempts` yang selesai, sistem mengirimkan riwayat jawaban siswa (dari `attempt_answers` dan `assessment_attempts`) ke Openrouter, kemudian menyimpan hasil analisis AI sebagai baris baru di `evaluations`.
9. **Pemantauan oleh guru** — guru mengakses dashboard kelasnya; sistem melakukan join antara `classes`, `class_enrollments`, `learning_progress`, dan `evaluations` untuk menampilkan gambaran menyeluruh capaian setiap siswa dalam kelas tersebut.

---

## 6. Integritas Data (Data Integrity)

| Aturan | Penerapan dalam Skema | Alasan Diperlukan |
|---|---|---|
| **Primary Key** | Setiap tabel memiliki `id` bertipe UUID sebagai primary key | Menjamin setiap baris data dapat diidentifikasi secara unik dan tidak ambigu saat dirujuk oleh tabel lain |
| **Foreign Key** | Misalnya `subchapters.chapter_id` → `chapters.id`, `assessment_attempts.student_id` → `users.id` | Menjaga agar data anak tidak pernah merujuk ke data induk yang tidak ada, mencegah data yatim (orphan data) |
| **Unique Constraint** | `users.email`, `assessments.subchapter_id`, disarankan juga pada `class_enrollments(class_id, student_id)` dan `learning_progress(student_id, subchapter_id)` | Mencegah duplikasi data yang secara bisnis seharusnya tunggal, misalnya satu email hanya untuk satu akun |
| **Not Null** | Kolom penting seperti `email`, `password_hash`, `role`, `title`, `question_text` diwajibkan terisi | Mencegah data kritikal kosong yang dapat menyebabkan kegagalan logika aplikasi |
| **Default Value** | `created_at DEFAULT now()`, `status DEFAULT 'not_started'`, `is_correct DEFAULT false` | Mengurangi beban aplikasi untuk mengisi nilai rutin secara manual dan menjaga konsistensi nilai awal |
| **Cascading Delete** | Disarankan `ON DELETE CASCADE` pada relasi seperti `subchapters → simulations`, `assessments → questions`, `chat_sessions → chat_messages`, `assessment_attempts → attempt_answers` | Ketika data induk dihapus (misalnya sub-bab dihapus oleh admin), data anak yang tidak lagi relevan akan ikut terhapus otomatis, mencegah data anak yatim tertinggal |
| **Cascading Update** | Tidak wajib diterapkan secara luas karena primary key menggunakan UUID yang tidak berubah nilainya, namun tetap dapat diaktifkan (`ON UPDATE CASCADE`) sebagai lapisan keamanan tambahan | Mengantisipasi skenario migrasi data di mana identitas baris berubah |
| **Referential Integrity** | Seluruh foreign key wajib merujuk ke primary key yang benar-benar ada di tabel induk | Menjamin keseluruhan grafik relasi data tetap konsisten dan dapat dipercaya untuk pengambilan keputusan (termasuk oleh AI saat menyusun evaluasi) |

Penerapan aturan integritas ini penting karena sistem melibatkan proses otomatis berbasis AI (evaluasi dan chatbot) yang mengandalkan data historis yang akurat. Data yang tidak konsisten akan menyebabkan AI memberikan evaluasi yang keliru kepada siswa.

---

## 7. Normalisasi Basis Data

### 7.1 First Normal Form (1NF)

Seluruh tabel telah memenuhi 1NF karena:
- Setiap kolom hanya menyimpan satu nilai atom (bukan nilai berulang dalam satu sel), kecuali kolom `options` dan `config` yang secara sengaja menggunakan tipe JSONB untuk menyimpan data semi-terstruktur yang secara alami bervariasi bentuknya (misalnya jumlah pilihan jawaban bisa 2 hingga 5 opsi). Penggunaan JSONB di sini merupakan keputusan desain yang lazim dalam basis data modern (pola *polymorphic/schema-flexible column*), bukan pelanggaran normalisasi, karena data di dalamnya tidak perlu di-query berdasarkan struktur internalnya secara rutin.
- Setiap baris memiliki primary key yang unik.

### 7.2 Second Normal Form (2NF)

Seluruh tabel telah memenuhi 2NF karena:
- Setiap tabel menggunakan primary key tunggal (UUID), bukan primary key komposit, sehingga secara otomatis tidak ada ketergantungan parsial (partial dependency) terhadap sebagian dari primary key.
- Seluruh atribut non-key pada setiap tabel bergantung penuh pada primary key tabel tersebut, misalnya `question_text` pada tabel `questions` hanya bergantung pada `id` soal tersebut, bukan pada kombinasi lain.

### 7.3 Third Normal Form (3NF)

Seluruh tabel telah memenuhi 3NF karena tidak ditemukan ketergantungan transitif (transitive dependency), yaitu atribut non-key yang bergantung pada atribut non-key lain, bukan pada primary key. Sebagai contoh:
- Pada tabel `assessment_attempts`, kolom `score` bergantung langsung pada `id` percobaan tersebut, bukan bergantung pada `student_id` atau `assessment_id` secara transitif.
- Data guru (`full_name`, `email`) tidak diduplikasi ke dalam tabel `classes`, melainkan cukup dirujuk melalui `teacher_id`, sehingga jika nama guru berubah, cukup diperbarui satu kali di tabel `users`.

### 7.4 Rekomendasi Perbaikan

Meskipun struktur inti sudah memenuhi 3NF, terdapat beberapa area yang perlu diperhatikan pada tahap implementasi lanjutan:

- **Tabel `simulations.config` dan `questions.options`** sebaiknya tetap dipantau ukurannya; jika di kemudian hari muncul kebutuhan untuk melakukan pencarian atau pelaporan berbasis isi JSON secara rutin (misalnya "cari semua soal dengan opsi jawaban tertentu"), pertimbangkan untuk mengekstraksi field yang sering diakses menjadi kolom relasional tersendiri.
- **Riwayat penggunaan simulasi** saat ini belum memiliki tabel pencatatan (log) tersendiri. Jika ke depan dibutuhkan analitik seberapa sering siswa menggunakan simulasi tertentu, disarankan menambahkan tabel `simulation_logs` (relasi one-to-many dari `users` dan `simulations`) agar tidak membebani tabel `simulations` dengan data transaksional.
- **Tabel `evaluations`** saat ini menyimpan hasil akhir AI sebagai teks bebas. Apabila di masa depan dibutuhkan analisis terstruktur (misalnya skor kekuatan per topik), disarankan menambahkan tabel turunan seperti `evaluation_topic_scores` agar tetap sesuai dengan prinsip 3NF ketika granularitas data bertambah.

---

## 8. Optimasi Basis Data

### 8.1 Indeks yang Perlu Dibuat

| Tabel | Kolom | Alasan |
|---|---|---|
| users | email | Digunakan pada setiap proses login; wajib memiliki indeks unik |
| class_enrollments | class_id, student_id | Sering digunakan untuk memfilter siswa per kelas dan sebaliknya |
| subchapters | chapter_id | Sering digunakan untuk menampilkan daftar sub-bab dalam satu bab |
| assessment_attempts | student_id, assessment_id | Digunakan untuk mengambil riwayat pengerjaan siswa dan statistik per asesmen |
| attempt_answers | attempt_id | Digunakan untuk menampilkan rincian jawaban per percobaan |
| learning_progress | student_id, subchapter_id | Digunakan untuk menghitung progres belajar per siswa maupun per materi |
| evaluations | student_id | Digunakan untuk mengambil evaluasi terbaru seorang siswa |
| chat_messages | session_id | Digunakan untuk menampilkan riwayat percakapan secara berurutan |

### 8.2 Kolom yang Sering Digunakan pada Klausa WHERE

Berdasarkan alur penggunaan sistem, kolom yang paling sering muncul pada klausa `WHERE` adalah: `users.email`, `class_enrollments.class_id`, `subchapters.chapter_id`, `assessment_attempts.student_id`, `learning_progress.student_id`, dan `chat_messages.session_id`. Kolom-kolom inilah yang menjadi prioritas utama pemberian indeks.

### 8.3 Strategi Optimasi Kueri

- Gunakan **composite index** pada kombinasi kolom yang sering di-query bersamaan, misalnya `(student_id, subchapter_id)` pada `learning_progress`.
- Terapkan **pagination** (`LIMIT` dan `OFFSET`, atau cursor-based pagination) pada seluruh kueri yang berpotensi mengembalikan data dalam jumlah besar, seperti `chat_messages` dan `attempt_answers`.
- Hindari `SELECT *` pada kueri yang berjalan otomatis (misalnya pemanggilan berkala oleh backend untuk memicu evaluasi AI); ambil hanya kolom yang benar-benar diperlukan.
- Gunakan **materialized view** atau tabel ringkasan (summary table) apabila dashboard guru mulai melambat karena harus menghitung agregasi progres dan evaluasi secara real-time dari banyak tabel sekaligus.
- Manfaatkan **connection pooling** (misalnya melalui PgBouncer, yang juga disediakan Neon) mengingat arsitektur serverless Next.js dapat memicu banyak koneksi singkat secara bersamaan.

### 8.4 Strategi Backup Basis Data

- Manfaatkan fitur **point-in-time recovery (PITR)** yang disediakan Neon pada tingkatan gratis maupun berbayar, yang memungkinkan basis data dikembalikan ke kondisi pada waktu tertentu.
- Jadwalkan **ekspor logis (logical dump)** menggunakan `pg_dump` secara berkala (harian/mingguan) sebagai cadangan tambahan yang disimpan terpisah dari penyedia basis data utama, guna mengantisipasi kegagalan pada sisi penyedia layanan.
- Simpan cadangan pada penyimpanan yang berbeda dari basis data produksi (prinsip 3-2-1 backup: tiga salinan data, dua jenis media berbeda, satu salinan di lokasi terpisah).

### 8.5 Strategi Pemulihan Basis Data

- Susun **runbook pemulihan** yang berisi langkah-langkah pemulihan basis data dari cadangan, termasuk kredensial dan endpoint yang perlu diperbarui pada Next.js setelah pemulihan.
- Lakukan **uji pemulihan (restore drill)** secara berkala pada lingkungan staging untuk memastikan proses pemulihan benar-benar berjalan, bukan sekadar tersedia secara teori.
- Terapkan **migrasi terversi (versioned migrations)**, misalnya melalui Prisma Migrate atau Drizzle Kit, sehingga struktur basis data dapat direkonstruksi ulang secara konsisten jika diperlukan pemulihan menyeluruh.

---

## 9. Skenario Penggunaan Basis Data

| Proses/Skenario | Tabel yang Terlibat |
|---|---|
| Siswa/guru login ke sistem | `users` |
| Guru membuat kelas baru | `users`, `classes` |
| Siswa didaftarkan ke sebuah kelas | `users`, `classes`, `class_enrollments` |
| Siswa membuka daftar bab dan sub-bab materi | `chapters`, `subchapters` |
| Siswa membuka simulasi kalkulator resistor atau rangkaian | `subchapters`, `simulations` |
| Siswa menggunakan sandbox kelistrikan bebas | `simulations` |
| Siswa berdiskusi dengan chatbot AI | `users`, `subchapters`, `chat_sessions`, `chat_messages` |
| Siswa mengerjakan ujian formatif suatu sub-bab | `subchapters`, `assessments`, `questions`, `assessment_attempts`, `attempt_answers` |
| Sistem memperbarui status progres belajar | `learning_progress` |
| Sistem menghasilkan evaluasi AI setelah asesmen selesai | `assessment_attempts`, `attempt_answers`, `evaluations` |
| Guru melihat dashboard progres dan evaluasi kelas | `classes`, `class_enrollments`, `learning_progress`, `evaluations`, `users` |

---

## 10. Kesimpulan

### 10.1 Kelebihan Rancangan Basis Data

Rancangan basis data ini memisahkan setiap domain fungsional (identitas pengguna, kelas, materi, simulasi, asesmen, evaluasi, dan chatbot) ke dalam tabel-tabel yang saling terhubung secara jelas melalui foreign key, sehingga setiap fitur di dalam navbar aplikasi memiliki fondasi data yang berdiri sendiri namun tetap terintegrasi satu sama lain. Struktur ini juga secara eksplisit mendukung persyaratan bisnis inti: satu login dengan dua peran, materi berjenjang, simulasi yang terikat maupun bebas dari materi, kewajiban asesmen formatif, evaluasi berbasis AI yang aktif setelah asesmen pertama, serta pemantauan guru berbasis kelas.

### 10.2 Skalabilitas

Penggunaan UUID sebagai primary key, pemisahan tabel transaksional (`assessment_attempts`, `attempt_answers`, `learning_progress`, `chat_messages`) dari tabel master (`users`, `chapters`, `subchapters`), serta dukungan tipe data JSONB untuk konten yang bervariasi, membuat basis data ini siap menampung pertumbuhan jumlah pengguna, materi, maupun riwayat interaksi tanpa memerlukan perombakan skema secara fundamental.

### 10.3 Kemudahan Pemeliharaan

Karena setiap tabel memiliki tanggung jawab tunggal yang jelas, pengembang baru dapat memahami fungsi setiap tabel hanya dengan membaca namanya dan relasinya, tanpa perlu menelusuri seluruh basis kode aplikasi. Aturan integritas referensial yang konsisten juga mengurangi risiko data yang tidak valid menyebar ke seluruh sistem.

### 10.4 Kemudahan Pengembangan Fitur Baru

Struktur modular ini memungkinkan penambahan fitur baru dengan dampak minimal terhadap tabel yang sudah ada, misalnya penambahan sertifikat kelulusan, forum diskusi antar siswa, atau leaderboard gamifikasi, cukup dilakukan dengan menambahkan tabel baru yang merujuk ke `users`, `classes`, atau `subchapters` yang telah ada.

### 10.5 Dukungan Integrasi API dan AI

Tabel `chat_sessions`, `chat_messages`, dan `evaluations` dirancang khusus agar riwayat percakapan dan hasil analisis Large Language Model dapat disimpan dan dipanggil kembali sebagai konteks pada permintaan berikutnya ke Openrouter API, tanpa mengganggu integritas data akademik inti seperti nilai dan progres belajar.

---

### Ringkasan Rancangan Basis Data (untuk Pengembang dan Peneliti)

- Basis data terdiri atas **14 tabel** yang terbagi ke dalam lima domain: pengguna & kelas, materi, simulasi, asesmen & evaluasi, serta chatbot.
- Menggunakan **PostgreSQL (Neon)** dengan pendekatan **model relasional**, memanfaatkan **UUID** sebagai primary key di seluruh tabel.
- Relasi didominasi oleh **one-to-many**, dengan satu relasi **many-to-many** (siswa–kelas melalui `class_enrollments`) dan satu relasi **one-to-one** (sub-bab–asesmen).
- Struktur materi bersifat **berjenjang dua tingkat** (`chapters` → `subchapters`), sesuai kebutuhan penyampaian materi kelistrikan dasar.
- Fitur AI (chatbot dan evaluasi) memiliki **tabel khusus** yang terpisah dari data akademik inti, memudahkan integrasi dengan Openrouter tanpa mengorbankan struktur relasional.
- Skema telah memenuhi **1NF, 2NF, dan 3NF**, dengan beberapa rekomendasi ekstensi tabel untuk kebutuhan analitik lanjutan di masa depan.
- Prioritas **indeks** difokuskan pada kolom kunci pencarian: `email`, kombinasi `student_id`/`class_id`/`subchapter_id`, dan `session_id`.
- Strategi **backup dan recovery** memanfaatkan fitur bawaan Neon (point-in-time recovery) yang dikombinasikan dengan ekspor logis berkala sebagai lapisan cadangan tambahan.
- Rancangan ini siap dijadikan acuan langsung untuk pembuatan skema Prisma/Drizzle maupun sebagai spesifikasi bagi agen coding otomatis dalam tahap implementasi.
