require('dotenv').config();
const express = require('express');
const cors = require('cors');

const createTables = require('./models/createTables');
const ordersRouter = require('./routes/orders');
const returnsRouter = require('./routes/returns');
const ticketsRouter = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

createTables();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/orders', ordersRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/tickets', ticketsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'ROUTE_NOT_FOUND' });
});

app.listen(PORT, () => {
  console.log(`Northstar backend running on http://localhost:${PORT}`);
});