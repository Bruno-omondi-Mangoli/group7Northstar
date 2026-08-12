markdown
# Northstar Backend — Support Deflection MVP

Express + SQLite API serving order status, returns/refunds, and ticket
automation for the Northstar Support Deflection MVP.

## Requirements
- Node.js 18+
- npm

## Setup

```bash
cd backend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` (optional — defaults work out of the box):

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| PORT | 4000 | Port the API server runs on |

## Seed the Database

Creates the SQLite tables and inserts sample orders, order items, and
returns. Safe to re-run — it clears and re-inserts data each time.

```bash
npm run seed
```

Expected output:
Tables created successfully.
Seeded 5 orders, 5 items, 3 returns.



## Run the Server

```bash
npm run dev
```

Expected output:
Tables created successfully.
Northstar backend running on http://localhost:4000



The dev server auto-restarts on file changes (via nodemon). Use `npm start`
instead for a plain run without file watching.

## Verify It's Running

```bash
curl http://localhost:4000/health
```
Expected: `{"status":"ok"}`

## API Endpoints

See [`../docs/API_CONTRACT.md`](../docs/API_CONTRACT.md) for full request/response
details. Summary:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/orders/:orderId | Full order details |
| GET | /api/orders/:orderId/status | Order status only |
| GET | /api/returns/:orderId | Return eligibility + refund status |
| POST | /api/tickets | Log a support question as a ticket |
| POST | /api/tickets/:ticketId/classify | Classify a ticket's category |
| POST | /api/tickets/:ticketId/resolve | Auto-resolve or escalate a ticket |

## Sample Order IDs (from seed data)

| Order ID | Status | Has Return? |
|---|---|---|
| ORD123 | SHIPPED | No |
| ORD124 | PENDING | Yes — ineligible (not delivered) |
| ORD125 | DELIVERED | Yes — eligible, refund NONE |
| ORD126 | DELIVERED | Yes — eligible, refund PENDING |
| ORD127 | SHIPPED | No |

Use these when testing the chatbot or dashboard against this API.

## Project Structure
backend/
├── src/
│ ├── server.js ← app entry point
│ ├── db/ ← SQLite connection
│ ├── models/ ← table creation
│ ├── routes/ ← orders, returns, tickets
│ └── automation/ ← (reserved for Eng 4's classification rules)
├── data/
│ ├── seed.js ← seed script
│ └── northstar.db ← generated SQLite file (gitignored)
└── .env.example



## Known Limitations

- No authentication — this is a sandboxed MVP, not production-ready.
- Classification is keyword/rule-based, not ML — see `src/routes/tickets.js`.
- SQLite file resets on `npm run seed` — don't run seed against data you want to keep during a live demo.