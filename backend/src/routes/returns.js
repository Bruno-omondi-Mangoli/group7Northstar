const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/returns/:orderId
router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;

  const order = db.prepare('SELECT orderId FROM orders WHERE orderId = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
  }

  const returnRecord = db.prepare('SELECT orderId, eligible, reason, refundStatus FROM returns WHERE orderId = ?').get(orderId);

  if (!returnRecord) {
    return res.status(200).json({
      orderId,
      eligible: false,
      reason: 'No return request on file for this order',
      refundStatus: 'NONE',
    });
  }

  res.status(200).json({
    ...returnRecord,
    eligible: !!returnRecord.eligible,
  });
});

module.exports = router;