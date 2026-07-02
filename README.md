# 🍽️ Cari Makan Web (Fullstack)

**Cari Makan Web** adalah aplikasi fullstack berbasis web untuk pemesanan makanan, lengkap dengan sistem manajemen admin, pembaruan status pesanan secara otomatis (auto-refresh), dan tampilan yang responsif untuk berbagai perangkat (khususnya *mobile-friendly*).

## ✨ Fitur Utama

### 📱 User & Frontend
- **Pemesanan Mudah:** Pengguna dapat menelusuri daftar makanan, melihat detail, dan melakukan pemesanan via keranjang.
- **Tampilan Responsif:** Halaman utama, keranjang, *checkout*, dan navigasi bawah (*bottom navigation*) dirancang agar nyaman digunakan dari HP (Mobile-friendly).
- **Struk Pemesanan Dinamis:** Tampilan struk pesanan otomatis menyesuaikan status perubahan dari admin.
- **Auto-polling Pesanan:** Data pesanan diperbarui otomatis setiap 3 detik tanpa perlu melakukan refresh halaman browser.

### 🛡️ Admin Dashboard
- **Manajemen Pesanan (*Real-time*):** Dashboard admin otomatis me-refresh pesanan setiap 3 detik tanpa perlu menekan tombol refresh manual.
- **CRUD Makanan & Transaksi:** Admin dapat menambah, mengedit, dan menghapus menu makanan, serta memantau keseluruhan riwayat transaksi.
- **Update Status Akurat:** Admin dapat mengubah status pesanan (Pending, Diproses, Completed, Dibatalkan) langsung pada antarmuka. Notifikasi sukses/gagal akan tampil dan hilang otomatis.
- **Export Transaksi:** Fitur *export* seluruh riwayat transaksi ke dalam format file Excel.
- **Pencatatan Keuangan Pintar:** Transaksi pemasukan otomatis tercatat apabila status pesanan diubah ke "Completed", dan otomatis dihapus jika dibatalkan/diubah statusnya untuk mencegah duplikasi rekap laporan.

## 🛠️ Teknologi yang Digunakan

**Frontend:**
- [React](https://react.org/) (di-build dengan [Vite](https://vitejs.dev/))
- [React Router DOM](https://reactrouter.com/) (Navigasi)
- [Tailwind CSS v4](https://tailwindcss.com/) (Styling)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MySQL2](https://www.npmjs.com/package/mysql2) (Database Driver)
- [JWT (JSON Web Tokens)](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs) (Autentikasi & Keamanan)

## 🚀 Cara Menjalankan Aplikasi di Lokal

### 1. Persiapan Database
1. Pastikan Anda memiliki server MySQL (misal: XAMPP, Laragon, MySQL Server) berjalan.
2. Buat database baru (contoh: `carimakan`).
3. Import file database yang ada pada folder `database/` (import `carimakan.sql` lalu `update_admin_crud_transaksi.sql` jika diperlukan, namun untuk versi ini bila sudah pernah import tidak perlu dilakukan ulang).

### 2. Konfigurasi & Menjalankan Backend
1. Buka terminal baru dan arahkan direktori ke folder `backend`.
2. Instal dependensi:
   ```bash
   cd backend
   npm install
   ```
3. Sesuaikan konfigurasi koneksi database jika Anda menggunakan kredensial MySQL berbeda (biasanya diatur pada file database setup di backend).
4. Jalankan backend server:
   ```bash
   npm run dev
   ```
   > Backend akan berjalan secara default di URL: `http://localhost:5000`

### 3. Konfigurasi & Menjalankan Frontend
1. Buka terminal baru dan arahkan direktori ke folder `frontend`.
2. Instal dependensi:
   ```bash
   cd frontend
   npm install
   ```
3. Jalankan aplikasi frontend (React):
   ```bash
   npm run dev
   ```
   > Frontend akan berjalan secara default di URL: `http://localhost:5173`

*Catatan Penting: Pastikan Backend dan Frontend dijalankan secara bersamaan agar fitur auto-refresh serta pemanggilan API ke MySQL berfungsi dengan baik.*

---
*Dibuat oleh [Rezafahmi17](https://github.com/Rezafahmi17)*
