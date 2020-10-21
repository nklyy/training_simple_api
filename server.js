const bodyParser = require('body-parser');
const express = require('express');

// Routs
const { router } = require('./routers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Routs
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server has been started on ${PORT}`);
});
