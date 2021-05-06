const express = require('express');
const cors = require('cors');
const { crawlerFunc } = require('./utils/crawl');

const port = process.env.PORT;


const app = express();

app.use(cors());
app.use(express.json());



app.get('/start-crawling', (req, res) => {
    console.log('start-crawling req')
    crawlerFunc();
    res.send("bla bla");
})

app.listen(port, () => console.log('listening on port' + port));














   
