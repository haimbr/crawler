const express = require('express');
const cors = require('cors');
const { crawlerFunc, isWorkerRunning } = require('./utils/crawl');

const port = process.env.PORT;


const app = express();

app.use(cors());
app.use(express.json());



app.get('/start-crawling', (req, res) => {
    if(!isWorkerRunning){
        crawlerFunc();
    }
    res.send();
}) 

app.listen(port, () => console.log('listening on port' + port));

 












   
