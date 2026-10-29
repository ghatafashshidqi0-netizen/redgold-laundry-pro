const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { createTransaction, getTransactions } = require('../controllers/transactionController');
const { createFinanceRecord } = require('../controllers/financeController');

router.post('/auth/login', (req, res) => {
  res.json({ message: 'Login berhasil', token: 'sample_jwt_token_redgold' });
});

router.post('/transactions', verifyToken, checkRole(['super_admin', 'manager', 'cashier']), createTransaction);
router.get('/transactions', verifyToken, getTransactions);

router.get('/customers', verifyToken, (req, res) => {
  res.json([{ id: 1, name: 'Budi Santoso', phone: '081234567890', loyalty_points: 120 }]);
});

router.get('/inventory', verifyToken, (req, res) => {
  res.json([{ sku: 'DET-01', name: 'Deterjen Cair Premium', stock_qty: 45.00, unit: 'Liter' }]);
});

router.post('/finance', verifyToken, checkRole(['super_admin', 'owner', 'manager', 'cashier']), createFinanceRecord);

module.exports = router;

