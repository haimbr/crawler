const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const http = require('http');


const { sendTaskToSqs } = require('./utils/queue');
const { startWorkers, createTsk, controlTasks, endCrawlEvent } = require('./utils/task');

let users = [];

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')));



io.on('connection', (socket) => {
    users.push(socket.id);

    endCrawlEvent.on('endCrawling', result => {
        if (result.taskId === socket.id) {
            console.log('end Crawling');
            socket.emit('message', result);
        }
    });
 
    socket.on('start-crawling', (result) => {
        console.log('start task');
        createTsk(socket.id, result.maxPages, result.maxDepth);
        sendTaskToSqs(result.pageUrl, socket.id);
        startWorkers();
        socket.emit('message', socket.id);
    })
});





app.post('/crawl-url', (req, res) => {
    createTsk(req.query.id, req.query.maxPages, req.query.maxDepth);
    console.log(req.query.pageUrl)
    sendTaskToSqs(req.query.pageUrl, req.query.id);
    startWorkers();
    res.send('bla bla');
});


app.post('/crawled-pages', (req, res) => {
    console.log('new page from worker')
    controlTasks(req.body.data.data, req.body.data.taskId);
    res.send('bla bla2');
});


server.listen(port, () => console.log('listening on port' + port));

