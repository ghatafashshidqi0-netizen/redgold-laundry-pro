const db = require('../config/db');

const createTransaction = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { customer_id, branch_id, order_source, items, discount = 0, express_fee = 0, delivery_fee = 0, notes } = req.body;
    const cashier_id = req.user.id;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countRes = await client.query('SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = CURRENT_DATE');
    const seq = parseInt(countRes.rows[0].count) + 1;
    const invoice_number = `RG-${dateStr}-${String(seq).padStart(4, '0')}`;

    let subtotal = 0;
    let maxDuration = 24;

    for (let item of items) {
      const serviceRes = await client.query('SELECT * FROM services WHERE id = $1', [item.service_id]);
      if (serviceRes.rows.length === 0) throw new Error(`Layanan ID ${item.service_id} tidak ditemukan.`);
      const service = serviceRes.rows[0];

      const itemSubtotal = service.price * item.quantity;
      subtotal += itemSubtotal;
      if (service.estimated_duration_hours > maxDuration) maxDuration = service.estimated_duration_hours;
      
      item.service_name = service.name;
      item.unit_price = service.price;
      item.subtotal = itemSubtotal;
    }

    const total_amount = subtotal + Number(express_fee) + Number(delivery_fee) - Number(discount);
    const estimatedCompletion = new Date(Date.now() + maxDuration * 3600 * 1000);

    const txQuery = `
      INSERT INTO transactions (invoice_number, branch_id, customer_id, cashier_id, order_source, subtotal, express_fee, delivery_fee, discount, total_amount, estimated_completion, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
    `;
    const txValues = [invoice_number, branch_id, customer_id, cashier_id, order_source, subtotal, express_fee, delivery_fee, discount, total_amount, estimatedCompletion, notes];
    const txResult = await client.query(txQuery, txValues);
    const newTx = txResult.rows[0];

    for (let item of items) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, service_id, service_name, quantity, unit_price, subtotal, item_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newTx.id, item.service_id, item.service_name, item.quantity, item.unit_price, item.subtotal, item.item_notes || '']
      );
    }

    await client.query(
      `INSERT INTO transaction_timeline (transaction_id, user_id, previous_status, new_status, description)
       VALUES ($1, $2, NULL, 'pesanan_diterima', 'Pesanan dibuat.')`,
      [newTx.id, cashier_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Transaksi berhasil', transaction: newTx });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const getTransactions = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT T.*, c.name as customer_name, c.phone as customer_phone, u.name as cashier_name 
      FROM transactions T
      JOIN customers c ON T.customer_id = c.id
      JOIN users u ON T.cashier_id = u.id
      ORDER BY T.created_at DESC LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTransaction, getTransactions };

