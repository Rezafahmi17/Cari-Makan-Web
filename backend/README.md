# Backend CariMakan

Backend memakai Express.js dan MySQL.

## Route utama

- `GET /api/health` cek server.
- `GET /api/menus` tampilkan menu aktif.
- `GET /api/menus?includeInactive=true` tampilkan semua menu untuk admin.
- `POST /api/menus` tambah menu, perlu token admin.
- `PUT /api/menus/:id` update menu, perlu token admin.
- `DELETE /api/menus/:id` nonaktifkan menu, perlu token admin.
- `GET /api/orders` tampilkan pesanan.
- `POST /api/orders` membuat pesanan.
- `PATCH /api/orders/:id/status` update status pesanan, perlu token admin.
- `POST /api/auth/login` login admin.
- `GET /api/transactions` tampilkan transaksi admin, perlu token admin.
- `GET /api/transactions/summary` ringkasan pemasukan, pengeluaran, saldo.
- `POST /api/transactions` tambah transaksi.
- `PUT /api/transactions/:id` update transaksi.
- `DELETE /api/transactions/:id` hapus transaksi.

## Catatan transaksi otomatis

Jika admin mengubah status pesanan menjadi `Completed`, backend otomatis membuat transaksi `pemasukan` dengan kategori `Penjualan`. Jika status diubah kembali menjadi `Pending`, `Diproses`, atau `Dibatalkan`, pemasukan otomatis dari order tersebut dihapus agar laporan tidak dobel.
