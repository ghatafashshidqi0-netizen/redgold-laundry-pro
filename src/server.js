const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

app.listen(PORT, () => {
  console.log(`REDGOLD LAUNDRY PRO aktif dan berjalan pada port ${PORT}`);
});

