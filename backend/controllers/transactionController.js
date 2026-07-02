import pool from '../db.js';

const allowedTypes = ['pemasukan', 'pengeluaran'];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function mapTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    title: row.title,
    description: row.description || '',
    amount: Number(row.amount),
    ref_order_id: row.ref_order_id,
    transaction_date: row.transaction_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function validatePayload(payload, partial = false) {
  const errors = [];
  const { type, category, title, amount } = payload;

  if (!partial || type !== undefined) {
    if (!allowedTypes.includes(type)) errors.push('Tipe transaksi harus pemasukan atau pengeluaran');
  }

  if (!partial || category !== undefined) {
    if (!category || String(category).trim().length < 2) errors.push('Kategori transaksi wajib diisi');
  }

  if (!partial || title !== undefined) {
    if (!title || String(title).trim().length < 2) errors.push('Judul transaksi wajib diisi');
  }

  if (!partial || amount !== undefined) {
    if (!Number(amount) || Number(amount) < 1) errors.push('Nominal transaksi wajib lebih dari 0');
  }

  return errors;
}

export async function recordOrderIncome(order) {
  const title = `Penjualan ${order.id}`;
  const description = `Pemasukan otomatis dari pesanan ${order.id} atas nama ${order.customer_name}`;

  await pool.query(
    `INSERT INTO admin_transactions
      (type, category, title, description, amount, ref_order_id, transaction_date)
     VALUES ('pemasukan', 'Penjualan', ?, ?, ?, ?, CURDATE())
     ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      amount = VALUES(amount),
      type = 'pemasukan',
      category = 'Penjualan',
      transaction_date = VALUES(transaction_date),
      updated_at = CURRENT_TIMESTAMP`,
    [title, description, Number(order.total), order.id]
  );
}

export async function deleteOrderIncome(orderId) {
  await pool.query(
    `DELETE FROM admin_transactions
     WHERE ref_order_id = ? AND type = 'pemasukan' AND category = 'Penjualan'`,
    [orderId]
  );
}

export async function getTransactions(req, res, next) {
  try {
    const { type = '', search = '' } = req.query;
    const params = [];
    const where = [];

    if (type && allowedTypes.includes(type)) {
      where.push('type = ?');
      params.push(type);
    }

    if (search) {
      where.push('(title LIKE ? OR category LIKE ? OR description LIKE ? OR ref_order_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM admin_transactions ${whereSql}
       ORDER BY transaction_date DESC, id DESC`,
      params
    );

    res.json({ success: true, data: rows.map(mapTransaction) });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionSummary(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE 0 END), 0) AS total_pemasukan,
        COALESCE(SUM(CASE WHEN type = 'pengeluaran' THEN amount ELSE 0 END), 0) AS total_pengeluaran,
        COALESCE(SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE -amount END), 0) AS saldo
       FROM admin_transactions`
    );

    const row = rows[0] || { total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 };
    res.json({
      success: true,
      data: {
        total_pemasukan: Number(row.total_pemasukan),
        total_pengeluaran: Number(row.total_pengeluaran),
        saldo: Number(row.saldo),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const {
      type,
      category,
      title,
      description = '',
      amount,
      transaction_date = todayDate(),
      ref_order_id = null,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO admin_transactions
        (type, category, title, description, amount, transaction_date, ref_order_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type, category, title, description, Number(amount), transaction_date, ref_order_id || null]
    );

    const [rows] = await pool.query('SELECT * FROM admin_transactions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Transaksi berhasil ditambahkan', data: mapTransaction(rows[0]) });
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(req, res, next) {
  try {
    const errors = validatePayload(req.body, true);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const [exists] = await pool.query('SELECT * FROM admin_transactions WHERE id = ? LIMIT 1', [req.params.id]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    const { type, category, title, description, amount, transaction_date, ref_order_id } = req.body;

    await pool.query(
      `UPDATE admin_transactions
       SET type = COALESCE(?, type),
           category = COALESCE(?, category),
           title = COALESCE(?, title),
           description = COALESCE(?, description),
           amount = COALESCE(?, amount),
           transaction_date = COALESCE(?, transaction_date),
           ref_order_id = ?
       WHERE id = ?`,
      [
        type ?? null,
        category ?? null,
        title ?? null,
        description ?? null,
        amount === undefined ? null : Number(amount),
        transaction_date ?? null,
        ref_order_id === undefined ? exists[0].ref_order_id : (ref_order_id || null),
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM admin_transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Transaksi berhasil diubah', data: mapTransaction(rows[0]) });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM admin_transactions WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}
