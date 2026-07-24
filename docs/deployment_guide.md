# Deployment & Troubleshooting Guide

Dokumen ini berisi panduan teknis deployment lokal (dan ke tahap produksi), serta dokumentasi pemecahan masalah (troubleshooting) untuk berbagai bug yang ditemukan dan diselesaikan selama tahap pengembangan aplikasi ini.

## 1. Persiapan Deployment (Lokal & Produksi)

Aplikasi dibangun menggunakan **Next.js 14 App Router**, **Tailwind CSS**, **Drizzle ORM**, dan **Neon Postgres**. Agar aplikasi dapat berjalan di environment manapun, konfigurasi utama harus tersedia di file `.env`.

### Konfigurasi `.env`
Gunakan `.env.example` sebagai referensi. Buat file `.env` dan pastikan memuat variabel berikut:
```env
# URL Koneksi Postgres (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_0WGl3HdUJgrz@ep-green-moon-az1ogzim-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Secret untuk enkripsi sesi Auth.js
AUTH_SECRET="random_string_minimal_32_karakter"

# Kunci API OpenRouter (Untuk evaluasi AI dan Chatbot)
OPENROUTER_API_KEY="sk-or-v1-..."
```

### Sinkronisasi Skema Database
Sebelum aplikasi pertama kali dijalankan, seluruh tabel harus disinkronisasikan ke dalam Neon Postgres menggunakan Drizzle.
Jalankan perintah berikut:
```bash
npx drizzle-kit push
```
Drizzle otomatis mendeteksi variabel `DATABASE_URL` dari file `.env` dan membuat struktur tabel (`users`, `classes`, `materials`, dsb.).

### Menjalankan Server
Untuk tahap development, gunakan:
```bash
npm run dev
```

Untuk tahap produksi, pastikan membuat build statis terlebih dahulu:
```bash
npm run build
npm run start
```

---

## 2. Dokumentasi Solusi Masalah (Troubleshooting & Bug Fixes)

Selama pengujian Quality Control (QC), beberapa kendala kritis ditemukan dan telah diperbaiki:

### A. TypeError `asChild` pada Komponen Button + Link (Build Error)
- **Masalah:** Saat menjalankan `npm run build`, Next.js mengeluarkan TypeError `Property 'asChild' does not exist on type...` pada komponen `Button` Shadcn yang membungkus komponen `Link`.
- **Solusi:** Alih-alih menggunakan `<Button asChild><Link href="...">...</Link></Button>`, solusinya adalah memanfaatkan properti `className` pada komponen `Link` secara langsung bersama utilitas `buttonVariants` bawaan Shadcn UI. 
- **Implementasi:** Digunakan pada `AssessmentRunner.tsx` dan `RecommendedMaterials.tsx`.

### B. Masalah Pengalihan (Redirect) Form Login & Register 
- **Masalah:** Next.js Form Actions dengan `action={handleSubmit}` yang dipanggil bersamaan dengan transisi klien (`useTransition`) kerap kali mereset state formulir jika error `NEXT_REDIRECT` terjadi secara implisit dalam proses autentikasi (silent failure).
- **Solusi:** 
  1. Mengubah atribut form dari `action={handleSubmit}` ke handler standar `onSubmit={handleSubmit}`.
  2. Memanggil `e.preventDefault()` untuk mencegah penelusuran native form browser.
  3. Memastikan metode `signIn("credentials")` (dari NextAuth v5) di fungsi `loginUser` menggunakan parameter `redirectTo: "/dashboard"`. Metode `signIn` dari Auth.js akan melempar (throw) error `NEXT_REDIRECT` apabila sukses, yang secara otomatis ditangkap oleh sistem Next.js router dan mengarahkan klien ke dashboard.

### C. Kebocoran Informasi (Information Disclosure) SQL pada UX
- **Masalah:** Pada form `/dashboard/classes/enroll`, jika pengguna memasukkan ID UUID yang tidak valid/palsu, Drizzle melemparkan error SQL mentah tentang pelanggaran constraint (Foreign Key Violation). UI langsung mencetak error teknis ini ke layar pengguna.
- **Solusi:** Menangani error di dalam server action `enrollStudent`. Jika `catch` melempar `e.message` teknis, pesan diganti dengan kalimat ramah (contoh: *"Kelas tidak ditemukan atau ID kelas tidak valid"*). Ini mencegah kebocoran skema DB kepada peretas.

### D. Penanganan Port Menggantung (Port Hanging) di Localhost Windows
- **Masalah:** Menjalankan `npm run dev` baru dapat gagal jika *task* sebelumnya dihentikan paksa (SIGKILL) tetapi sub-proses Node masih berjalan pada Port 3000.
- **Solusi:** Selalu pastikan mematikan proses lama menggunakan Task Manager atau `taskkill /PID <nomor_pid> /F` sebelum meluncurkan sesi dev server yang baru jika menemui log *"Port 3000 is in use"*.

### E. UUID Kelas Tidak Tersedia di UI Guru (Class Code Availability)
- **Masalah:** Guru dapat membuat kelas, tetapi UUID (ID Kelas) tidak ditampilkan di halaman detail kelas. Hal ini menyebabkan siswa tidak memiliki cara untuk mengetahui UUID untuk bergabung ke kelas (pengguna melaporkan "UUID is not available").
- **Solusi:** Menambahkan elemen UI di halaman `/dashboard/classes/[classId]/page.tsx` yang secara eksplisit menampilkan `params.classId` (UUID) beserta instruksi bagi guru untuk menyalin dan membagikannya ke siswa.

---

## 3. Peta Arsitektur & Lokasi Kunci (Codebase Architecture)

Bagi pengembang yang ingin memodifikasi atau memperbarui program, berikut adalah lokasi-lokasi penting beserta fungsinya:

### A. Lokasi Model AI & Konfigurasi API
- **Fungsi Utama:** Digunakan untuk integrasi Chatbot (`Chatbot.tsx`) dan Evaluasi Ujian Otomatis.
- **Lokasi File:** 
  - `src/actions/chatbot.ts`
  - `src/actions/evaluations.ts`
- **Sintaks Kunci:** Konfigurasi pemanggilan model dilakukan menggunakan SDK `@ai-sdk/openai` yang di-override dengan OpenRouter.
  ```typescript
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  // Model didefinisikan di sini
  const model = openrouter("nvidia/nemotron-3-super-120b-a12b:free");
  ```
  *Jika ingin mengubah model (misal ke `gpt-4` atau LLaMA), ubah string di atas.*

### B. Lokasi Sistem Autentikasi (Auth.js)
- **Fungsi Utama:** Menangani login/register, session management, dan enkripsi cookie menggunakan NextAuth v5 (Auth.js).
- **Lokasi File:** 
  - `src/auth.ts` (Konfigurasi Provider & Callbacks)
  - `src/auth.config.ts` (Opsi middleware & rule)
  - `src/actions/auth.ts` (Server actions `loginUser` & `registerUser`)
  - `src/middleware.ts` (Router protection edge function)
- **Sintaks Kunci:** Logika validasi dan sign-in credentials terdapat di fungsi `authorize` dalam `src/auth.ts`. Modifikasi skema password (Bcrypt) dilakukan di sini.

### C. Lokasi Operasi Database & API (Server Actions)
- **Fungsi Utama:** Melakukan kueri ke Neon Postgres. Aplikasi ini *tidak menggunakan* folder `app/api/` tradisional, melainkan menggunakan pola **Next.js Server Actions** untuk mutasi data yang lebih aman dan terintegrasi langsung dengan React.
- **Lokasi File:** Folder `src/actions/`
  - `classes.ts` (Operasi membuat dan bergabung kelas)
  - `progress.ts` (Merekam dan mengambil analitik siswa)
- **Sintaks Kunci:** Seluruh aksi DB menggunakan `drizzle-orm`.
  ```typescript
  // Contoh Drizzle Select
  await db.select().from(users).where(eq(users.id, userId));
  ```
- **Lokasi Skema:** `src/db/schema.ts` (Untuk menambah/menghapus kolom tabel, edit file ini lalu jalankan `npx drizzle-kit push`).

Aplikasi kini sepenuhnya siap digunakan (Production Ready) dan dirancang untuk dapat dikembangkan secara modular.
