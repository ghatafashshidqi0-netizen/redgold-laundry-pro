const db = require('../config/db');

const createFinanceRecord = async (req, res) => {
  try {
    const { branch_id, type, category, amount, payment_method, description } = req.body;
    const recorded_by = req.user.id;
    const reference_number = `FIN-${Date.now()}`;

    const query = `
      INSERT INTO financials (branch_id, reference_number, type, category, amount, payment_method, description, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const values = [branch_id, reference_number, type, category, amount, payment_method, description, recorded_by];
    const result = await db.query(query, values);
    
    res.status(201).json({ message: 'Catatan keuangan berhasil disimpan', record: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createFinanceRecord };

