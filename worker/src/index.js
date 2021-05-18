const express = require('express');
const cors = require('cors');
const { startCrawling, isWorkerRunning } = require('./utils/crawler');

const port = process.env.PORT;


const app = express();

app.use(cors());
app.use(express.json());



app.get('/start-crawling', (req, res) => {
    if(!isWorkerRunning){
        startCrawling();
    }
    res.send();
}) 

app.listen(port, () => console.log('listening on port' + port));

 












   
