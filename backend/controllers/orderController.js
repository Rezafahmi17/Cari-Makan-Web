import pool from '../db.js';
import { deleteOrderIncome, recordOrderIncome } from './transactionController.js';

const allowedStatuses = ['Pending', 'Diproses', 'Completed', 'Dibatalkan'];

function normalizeStatus(value) {
  const statusText = String(value || '').trim().toLowerCase();
  return allowedStatuses.find((item) => item.toLowerCase() === statusText) || '';
}

function buildOrderId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${d}-${random}`;
}

function mapOrder(row, items = []) {
  return {
    id: row.id,
    date: row.created_at,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      address: row.customer_address,
    },
    items: items.map((item) => ({
      id: item.id,
      idMeal: String(item.menu_id),
      menu_id: item.menu_id,
      strMeal: item.menu_name,
      price: Number(item.price),
      qty: Number(item.qty),
      subtotal: Number(item.subtotal),
    })),
    total: Number(row.total),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getItemsByOrderIds(orderIds) {
  if (orderIds.length === 0) return new Map();

  const placeholders = orderIds.map(() => '?').join(',');
  const [items] = await pool.query(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
    orderIds
  );

  return items.reduce((map, item) => {
    if (!map.has(item.order_id)) map.set(item.order_id, []);
    map.get(item.order_id).push(item);
    return map;
  }, new Map());
}

export async function getOrders(req, res, next) {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const itemMap = await getItemsByOrderIds(orders.map((order) => order.id));

    res.json({
      success: true,
      data: orders.map((order) => mapOrder(order, itemMap.get(order.id) || [])),
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [req.params.id]);
    res.json({ success: true, data: mapOrder(orders[0], items) });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const { customer, items } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ success: false, message: 'Data pelanggan wajib lengkap' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Item pesanan tidak boleh kosong' });
    }

    const menuIds = [...new Set(items.map((item) => Number(item.menu_id || item.idMeal)).filter(Boolean))];
    if (menuIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Menu pesanan tidak valid' });
    }

    await connection.beginTransaction();

    const placeholders = menuIds.map(() => '?').join(',');
    const [menus] = await connection.query(
      `SELECT id, name, price, available FROM menus WHERE id IN (${placeholders})`,
      menuIds
    );

    const menuMap = new Map(menus.map((menu) => [Number(menu.id), menu]));
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuId = Number(item.menu_id || item.idMeal);
      const qty = Number(item.qty);
      const menu = menuMap.get(menuId);

      if (!menu || !menu.available) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Menu dengan ID ${menuId} tidak tersedia` });
      }

      if (!qty || qty < 1) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Jumlah item tidak valid' });
      }

      const price = Number(menu.price);
      const subtotal = price * qty;
      total += subtotal;
      orderItems.push({ menuId, menuName: menu.name, price, qty, subtotal });
    }

    const orderId = buildOrderId();

    await connection.query(
      `INSERT INTO orders (id, customer_name, customer_phone, customer_address, total, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [orderId, customer.name, customer.phone, customer.address, total]
    );

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.menuId, item.menuName, item.price, item.qty, item.subtotal]
      );
    }

    await connection.commit();

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [savedItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [orderId]);

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: mapOrder(orders[0], savedItems),
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const status = normalizeStatus(req.body?.status);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status pesanan tidak valid. Gunakan Pending, Diproses, Completed, atau Dibatalkan.',
      });
    }

    const [existingOrders] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [req.params.id]);

    if (existingOrders.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    if (existingOrders[0].status !== status) {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    }

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [req.params.id]);
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [req.params.id]);

    if (status === 'Completed') {
      await recordOrderIncome(orders[0]);
    } else {
      await deleteOrderIncome(req.params.id);
    }

    res.json({
      success: true,
      message: `Status pesanan berhasil diubah menjadi ${status}`,
      data: mapOrder(orders[0], items),
    });
  } catch (error) {
    next(error);
  }
}
