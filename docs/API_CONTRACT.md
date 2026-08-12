# API Contract — Northstar Support Deflection MVP

All responses are JSON. All errors return `{ "error": "ERROR_CODE" }` with an appropriate HTTP status.

---

## GET /api/orders/:orderId
Purpose: full order details, for the Dashboard.

Success (200):
{
  "orderId": "ORD123",
  "customerName": "Jane Doe",
  "status": "SHIPPED",
  "items": [{ "productName": "Blue T-Shirt", "quantity": 1 }],
  "orderDate": "2026-08-01",
  "expectedDelivery": "2026-08-15"
}

Error (404): { "error": "ORDER_NOT_FOUND" }

---

## GET /api/orders/:orderId/status
Purpose: lightweight status lookup, for the Chatbot.

Success (200):
{ "orderId": "ORD123", "status": "SHIPPED", "expectedDelivery": "2026-08-15" }

Error (404): { "error": "ORDER_NOT_FOUND" }

---

## GET /api/returns/:orderId
Purpose: return eligibility + refund status, for Chatbot + Dashboard.

Success (200):
{
  "orderId": "ORD123",
  "eligible": true,
  "reason": "Within 30-day return window",
  "refundStatus": "NONE"
}

Error (404): { "error": "ORDER_NOT_FOUND" }

---

## POST /api/tickets
Purpose: log every incoming chatbot question. Called on every message.

Request:
{ "question": "Where is my order ORD123?", "orderId": "ORD123" }
(orderId is optional — may be null if not extracted yet)

Success (201):
{ "ticketId": 1, "question": "...", "orderId": "ORD123", "status": "OPEN", "createdAt": "..." }

---

## POST /api/tickets/:ticketId/classify
Purpose: classify a ticket's question text.

Success (200):
{ "ticketId": 1, "category": "ORDER_STATUS", "tag": "AUTO_ORDER_STATUS" }
(category is one of: ORDER_STATUS | RETURN_REFUND | UNSUPPORTED)

Error (404): { "error": "TICKET_NOT_FOUND" }

---

## POST /api/tickets/:ticketId/resolve
Purpose: attempt to auto-answer using the classified category + orderId.

Success — resolved (200):
{ "ticketId": 1, "status": "AUTO_RESOLVED", "response": "Your order has shipped and is expected to arrive Friday." }

Success — escalated (200):
{ "ticketId": 1, "status": "ESCALATED", "reason": "No matching order found" }

Error (404): { "error": "TICKET_NOT_FOUND" }
