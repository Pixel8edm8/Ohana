const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ohana backend is running!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});