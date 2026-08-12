const express = require('express');
const db = require('../db/database');

const router = express.Router();

// POST /api/tickets
router.post('/', (req, res) => {
  const { question, orderId } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'QUESTION_REQUIRED' });
  }

  const result = db.prepare(`
    INSERT INTO tickets (question, orderId, status)
    VALUES (?, ?, 'OPEN')
  `).run(question, orderId || null);

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    ticketId: ticket.id,
    question: ticket.question,
    orderId: ticket.orderId,
    status: ticket.status,
    createdAt: ticket.createdAt,
  });
});

// POST /api/tickets/:ticketId/classify
router.post('/:ticketId/classify', (req, res) => {
  const { ticketId } = req.params;

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'TICKET_NOT_FOUND' });
  }

  const text = ticket.question.toLowerCase();
  let category = 'UNSUPPORTED';
  let tag = 'UNSUPPORTED';

  if (/(return|refund)/.test(text)) {
    category = 'RETURN_REFUND';
    tag = 'AUTO_RETURN_REFUND';
  } else if (/(where|ship|deliver|arrive|status|track)/.test(text)) {
    category = 'ORDER_STATUS';
    tag = 'AUTO_ORDER_STATUS';
  }

  db.prepare('UPDATE tickets SET category = ?, tag = ? WHERE id = ?').run(category, tag, ticketId);

  res.status(200).json({ ticketId: Number(ticketId), category, tag });
});

// POST /api/tickets/:ticketId/resolve
router.post('/:ticketId/resolve', (req, res) => {
  const { ticketId } = req.params;

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'TICKET_NOT_FOUND' });
  }

  if (!ticket.category || ticket.category === 'UNSUPPORTED' || !ticket.orderId) {
    db.prepare("UPDATE tickets SET status = 'ESCALATED' WHERE id = ?").run(ticketId);
    return res.status(200).json({
      ticketId: Number(ticketId),
      status: 'ESCALATED',
      reason: !ticket.orderId ? 'No order ID provided' : 'Question did not match a supported category',
    });
  }

  let responseText = null;

  if (ticket.category === 'ORDER_STATUS') {
    const order = db.prepare('SELECT status, expectedDelivery FROM orders WHERE orderId = ?').get(ticket.orderId);
    if (order) {
      responseText = `Your order is currently ${order.status.toLowerCase()}${order.expectedDelivery ? `, expected by ${order.expectedDelivery}` : ''}.`;
    }
  }

  if (ticket.category === 'RETURN_REFUND') {
    const ret = db.prepare('SELECT eligible, reason, refundStatus FROM returns WHERE orderId = ?').get(ticket.orderId);
    if (ret) {
      responseText = ret.eligible
        ? `Your order is eligible for return. ${ret.reason}. Refund status: ${ret.refundStatus}.`
        : `Your order is not eligible for return. ${ret.reason}.`;
    } else {
      responseText = 'No return request found for this order yet.';
    }
  }

  if (!responseText) {
    db.prepare("UPDATE tickets SET status = 'ESCALATED' WHERE id = ?").run(ticketId);
    return res.status(200).json({
      ticketId: Number(ticketId),
      status: 'ESCALATED',
      reason: 'No matching order found',
    });
  }

  db.prepare("UPDATE tickets SET status = 'AUTO_RESOLVED', response = ? WHERE id = ?").run(responseText, ticketId);

  res.status(200).json({
    ticketId: Number(ticketId),
    status: 'AUTO_RESOLVED',
    response: responseText,
  });
});

module.exports = router;