-- Update fitur Dashboard Admin CariMakan
-- Jalankan file ini jika database carimakan kamu sudah pernah diimport sebelumnya.
-- File ini tidak menghapus data orders/menus yang sudah ada.

USE carimakan;

CREATE TABLE IF NOT EXISTS admin_transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('pemasukan', 'pengeluaran') NOT NULL,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  amount INT UNSIGNED NOT NULL,
  ref_order_id VARCHAR(30) NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_transactions_ref_order (ref_order_id),
  KEY idx_admin_transactions_type (type),
  KEY idx_admin_transactions_date (transaction_date),
  CONSTRAINT fk_admin_transactions_order
    FOREIGN KEY (ref_order_id) REFERENCES orders(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admin_transactions (type, category, title, description, amount, transaction_date)
SELECT 'pengeluaran', 'Belanja Bahan', 'Pembelian bahan baku awal', 'Contoh pengeluaran untuk stok bahan makanan.', 150000, CURDATE()
WHERE NOT EXISTS (SELECT 1 FROM admin_transactions LIMIT 1);
