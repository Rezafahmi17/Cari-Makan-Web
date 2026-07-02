import pool from '../db.js';

function mapMenu(row) {
  return {
    id: row.id,
    idMeal: String(row.id),
    name: row.name,
    strMeal: row.name,
    category: row.category,
    strArea: row.category,
    price: Number(row.price),
    description: row.description,
    strInstructions: row.description,
    image_url: row.image_url,
    strMealThumb: row.image_url,
    available: Boolean(row.available),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getMenus(req, res, next) {
  try {
    const { search = '', category = '', includeInactive = 'false' } = req.query;
    const params = [];
    const where = includeInactive === 'true' ? [] : ['available = 1'];

    if (search) {
      where.push('(name LIKE ? OR category LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    const [rows] = await pool.query(
      `${where.length ? `SELECT * FROM menus WHERE ${where.join(' AND ')} ORDER BY id DESC` : 'SELECT * FROM menus ORDER BY id DESC'}`,
      params
    );

    res.json({ success: true, data: rows.map(mapMenu) });
  } catch (error) {
    next(error);
  }
}

export async function getMenuById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ? LIMIT 1', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    res.json({ success: true, data: mapMenu(rows[0]) });
  } catch (error) {
    next(error);
  }
}

export async function createMenu(req, res, next) {
  try {
    const { name, category, price, description = '', image_url = '', available = true } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, kategori, dan harga wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO menus (name, category, price, description, image_url, available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category, Number(price), description, image_url, available ? 1 : 0]
    );

    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: mapMenu(rows[0]) });
  } catch (error) {
    next(error);
  }
}

export async function updateMenu(req, res, next) {
  try {
    const { name, category, price, description, image_url, available } = req.body;

    const [exists] = await pool.query('SELECT * FROM menus WHERE id = ? LIMIT 1', [req.params.id]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    await pool.query(
      `UPDATE menus
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           price = COALESCE(?, price),
           description = COALESCE(?, description),
           image_url = COALESCE(?, image_url),
           available = COALESCE(?, available)
       WHERE id = ?`,
      [
        name ?? null,
        category ?? null,
        price === undefined ? null : Number(price),
        description ?? null,
        image_url ?? null,
        available === undefined ? null : (available ? 1 : 0),
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu berhasil diubah', data: mapMenu(rows[0]) });
  } catch (error) {
    next(error);
  }
}

export async function deleteMenu(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE menus SET available = 0 WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    res.json({ success: true, message: 'Menu berhasil dinonaktifkan' });
  } catch (error) {
    next(error);
  }
}
