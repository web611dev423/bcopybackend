const express = require('express');
const cors = require('cors');
const { createServer } = require('http');

const { initSocket } = require('./config/socket');
const dbConnect = require('./config/mongoose');

const routes = require('./routes');

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);


dbConnect();
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

