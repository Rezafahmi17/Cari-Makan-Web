# CariMakan Full Stack - Admin CRUD, Transaksi

Versi ini sudah menambahkan fitur berikut:

1. Auto refresh data pesanan setiap 3 detik.
2. Dashboard admin tidak perlu menekan tombol Refresh manual.
3. Struk pesanan otomatis mengikuti perubahan status dari admin.
4. Notifikasi status di dashboard admin hilang otomatis setelah beberapa detik.
5. Dashboard admin dibuat lebih responsive untuk tampilan HP.
6. Halaman struk pesanan dibuat lebih rapi di layar HP.
7. Halaman utama, detail makanan, keranjang, checkout, dan bottom navigation disesuaikan untuk mobile.
8. CRUD makanan dan transaksi admin tetap tersedia.
9. Export transaksi admin ke Excel tetap tersedia.

## File yang Diubah

### Frontend

- `frontend/src/context/OrderContext.jsx`
  - Menambahkan auto polling `loadOrders({ silent: true })` setiap 3 detik.
  - Data pesanan otomatis diperbarui tanpa refresh browser.

- `frontend/src/pages/Admin.jsx`
  - Menghapus kebutuhan tombol refresh manual.
  - Menambahkan indikator `Auto refresh aktif`.
  - Notifikasi berhasil/gagal akan hilang otomatis.
  - Data pesanan dan transaksi otomatis diperbarui setiap 3 detik.
  - Layout dashboard disesuaikan untuk tampilan HP.

- `frontend/src/pages/Orders.jsx`
  - Struk pesanan otomatis mengambil perubahan status.
  - Tombol refresh manual diganti indikator auto refresh.
  - Tampilan struk dibuat responsive dan tidak mudah melebar di HP.

- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Cart.jsx`
- `frontend/src/pages/Checkout.jsx`
- `frontend/src/pages/FoodDetail.jsx`
- `frontend/src/components/FoodCard.jsx`
- `frontend/src/components/BottomNav.jsx`
  - Penyesuaian padding, ukuran teks, grid, tombol, dan jarak agar lebih nyaman dibuka dari HP.

## Database

Tidak ada perubahan struktur database pada versi ini.
Kalau kamu sebelumnya sudah import:

- `carimakan.sql`
- `update_admin_crud_transaksi.sql`

maka tidak perlu import SQL lagi.

## Cara Menjalankan

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend berjalan di:

```txt
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:5173
```

## Catatan

Pastikan backend dan frontend berjalan bersamaan. Auto refresh hanya berjalan jika backend aktif dan database MySQL terhubung.

## Update Perbaikan Status Pesanan

Versi ini memperbaiki bagian Data Pesanan di dashboard admin agar status benar-benar bisa diganti ke:

- Pending
- Diproses
- Completed
- Dibatalkan

Perbaikan yang dilakukan:

1. Tombol status ditampilkan langsung pada setiap pesanan, sehingga admin tidak hanya bergantung pada dropdown.
2. Status berubah secara optimis di frontend, lalu disimpan ke backend dan database.
3. Backend menerima status secara lebih aman dan menormalkan nilai status sebelum menyimpan.
4. Jika status diubah menjadi Completed, transaksi pemasukan otomatis dicatat.
5. Jika status diubah dari Completed ke status lain, transaksi pemasukan otomatis dihapus agar laporan tidak dobel.
6. Jika memilih status yang sama, sistem tidak menampilkan error.

Tidak ada perubahan database pada update ini, jadi tidak perlu import SQL ulang.
