const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./models');
const PORT = process.env.PORT || 5000;
const app = express();
const { apiRouter} = require('./routes/index');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connectDB();

app.get('/health', (req, res) => {
  res.send('ok')
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`App listening at Port: ${PORT}`);
});