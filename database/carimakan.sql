-- Database CariMakan Full Stack
-- Jalankan file ini di phpMyAdmin / DBeaver / MySQL client.

CREATE DATABASE IF NOT EXISTS carimakan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE carimakan;

DROP TABLE IF EXISTS admin_transactions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(60) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE menus (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price INT UNSIGNED NOT NULL DEFAULT 0,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menus_category (category),
  KEY idx_menus_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id VARCHAR(30) NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_address TEXT NOT NULL,
  total INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Pending', 'Diproses', 'Completed', 'Dibatalkan') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_status (status),
  KEY idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(30) NOT NULL,
  menu_id INT UNSIGNED NOT NULL,
  menu_name VARCHAR(120) NOT NULL,
  price INT UNSIGNED NOT NULL,
  qty INT UNSIGNED NOT NULL DEFAULT 1,
  subtotal INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_menu_id (menu_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_menu
    FOREIGN KEY (menu_id) REFERENCES menus(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_transactions (
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

-- Login default admin:
-- username: admin
-- password: admin123
-- Untuk tugas kampus ini dibuat mudah dibaca. Setelah hosting, ganti password admin.
INSERT INTO admins (username, password_hash, name, role) VALUES
('admin', 'admin123', 'Administrator CariMakan', 'admin');

INSERT INTO menus (name, category, price, description, image_url, available) VALUES
('Nasi Goreng Spesial', 'Indonesian', 25000, 'Nasi goreng dengan telur, ayam suwir, sayuran, dan bumbu khas rumahan.', 'https://www.themealdb.com/images/media/meals/1529446137.jpg', 1),
('Mie Ayam Bakso', 'Indonesian', 22000, 'Mie ayam gurih dengan topping ayam kecap, sawi, pangsit, dan bakso.', 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg', 1),
('Sate Ayam Madura', 'Indonesian', 30000, 'Sate ayam dengan bumbu kacang, lontong, bawang goreng, dan sambal.', 'https://www.themealdb.com/images/media/meals/1548772327.jpg', 1),
('Ayam Geprek Sambal Bawang', 'Indonesian', 24000, 'Ayam crispy digeprek dengan sambal bawang pedas dan nasi hangat.', 'https://www.themealdb.com/images/media/meals/uwxusv1487344500.jpg', 1),
('Bakso Urat Komplit', 'Indonesian', 23000, 'Bakso urat dengan mie, bihun, tahu, sayur, dan kuah kaldu sapi.', 'https://www.themealdb.com/images/media/meals/tvtxpq1511464705.jpg', 1),
('Soto Ayam Lamongan', 'Indonesian', 21000, 'Soto ayam kuah kuning dengan koya, telur, ayam suwir, dan sambal.', 'https://www.themealdb.com/images/media/meals/1520084413.jpg', 1),
('Rendang Sapi', 'Indonesian', 35000, 'Rendang sapi empuk dengan bumbu rempah kental dan nasi putih.', 'https://www.themealdb.com/images/media/meals/bc8v651619789840.jpg', 1),
('Chicken Katsu Rice Bowl', 'Japanese', 28000, 'Nasi bowl dengan chicken katsu renyah, saus spesial, dan salad.', 'https://www.themealdb.com/images/media/meals/vwrpps1503068729.jpg', 1),
('Spaghetti Bolognese', 'Western', 32000, 'Pasta spaghetti dengan saus daging bolognese dan keju parut.', 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg', 1),
('Burger Beef Cheese', 'Western', 30000, 'Burger beef patty, keju, selada, tomat, dan saus spesial.', 'https://www.themealdb.com/images/media/meals/ursuup1487348423.jpg', 1);


INSERT INTO admin_transactions (type, category, title, description, amount, transaction_date) VALUES
('pengeluaran', 'Belanja Bahan', 'Pembelian bahan baku awal', 'Contoh pengeluaran untuk stok bahan makanan.', 150000, CURDATE()),
('pemasukan', 'Modal', 'Modal awal usaha', 'Contoh pemasukan modal awal untuk kas admin.', 500000, CURDATE());
