const db = require('../db/database');

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      orderId TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDING','SHIPPED','DELIVERED')),
      orderDate TEXT NOT NULL,
      expectedDelivery TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(orderId)
    );

    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      eligible INTEGER NOT NULL,
      reason TEXT,
      refundStatus TEXT NOT NULL DEFAULT 'NONE' CHECK(refundStatus IN ('NONE','PENDING','COMPLETED')),
      FOREIGN KEY (orderId) REFERENCES orders(orderId)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      orderId TEXT,
      category TEXT,
      tag TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','AUTO_RESOLVED','ESCALATED')),
      response TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Tables created successfully.');
}

module.exports = createTables;