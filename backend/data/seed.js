const db = require('../src/db/database');
const createTables = require('../src/models/createTables');

createTables();

// Clear existing data so seeding is repeatable
db.exec('DELETE FROM order_items; DELETE FROM returns; DELETE FROM orders; DELETE FROM tickets;');

const insertOrder = db.prepare(`
  INSERT INTO orders (orderId, customerName, status, orderDate, expectedDelivery)
  VALUES (?, ?, ?, ?, ?)
`);

const insertItem = db.prepare(`
  INSERT INTO order_items (orderId, productName, quantity)
  VALUES (?, ?, ?)
`);

const insertReturn = db.prepare(`
  INSERT INTO returns (orderId, eligible, reason, refundStatus)
  VALUES (?, ?, ?, ?)
`);

const orders = [
  ['ORD123', 'Jane Doe', 'SHIPPED', '2026-08-01', '2026-08-15'],
  ['ORD124', 'John Smith', 'PENDING', '2026-08-10', '2026-08-20'],
  ['ORD125', 'Amara Wanjiru', 'DELIVERED', '2026-07-20', '2026-07-28'],
  ['ORD126', 'Sam Okoro', 'DELIVERED', '2026-07-15', '2026-07-22'],
  ['ORD127', 'Lucy Chen', 'SHIPPED', '2026-08-05', '2026-08-18'],
];

const items = [
  ['ORD123', 'Blue T-Shirt', 1],
  ['ORD124', 'Running Shoes', 1],
  ['ORD125', 'Wireless Headphones', 2],
  ['ORD126', 'Coffee Mug', 3],
  ['ORD127', 'Backpack', 1],
];

const returns = [
  ['ORD125', 1, 'Within 30-day return window', 'NONE'],
  ['ORD126', 1, 'Within 30-day return window', 'PENDING'],
  ['ORD124', 0, 'Order not yet delivered', 'NONE'],
];

for (const o of orders) insertOrder.run(...o);
for (const i of items) insertItem.run(...i);
for (const r of returns) insertReturn.run(...r);

console.log(`Seeded ${orders.length} orders, ${items.length} items, ${returns.length} returns.`);