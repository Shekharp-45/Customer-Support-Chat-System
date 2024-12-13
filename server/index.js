const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const port = 5000;

dotenv.config();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
