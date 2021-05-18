const express = require('express');
const cors = require('cors');
const path = require('path');

const workerRouter = require('./routers/worker-router');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cors());

app.use(workerRouter);

module.exports = app;