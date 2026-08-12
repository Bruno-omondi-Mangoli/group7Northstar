const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/orders/:orderId
router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;

  const order = db.prepare('SELECT * FROM orders WHERE orderId = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
  }

  const items = db.prepare('SELECT productName, quantity FROM order_items WHERE orderId = ?').all(orderId);

  res.status(200).json({ ...order, items });
});

// GET /api/orders/:orderId/status
router.get('/:orderId/status', (req, res) => {
  const { orderId } = req.params;

  const order = db.prepare('SELECT orderId, status, expectedDelivery FROM orders WHERE orderId = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
  }

  res.status(200).json(order);
});

module.exports = router;