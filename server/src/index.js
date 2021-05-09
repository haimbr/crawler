const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const http = require('http');

const { startWorkers, createTsk, endCrawlEvent, sendUrlsToCrawler, controlTasks } = require('./utils/task');

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
            socket.emit('new-result', result.data);
        }
    });

    socket.on('start-crawling', (result) => {
        createTsk(socket.id, result.maxPages, result.maxDepth);
        sendUrlsToCrawler([result.pageUrl], socket.id);
        startWorkers();
    })
});
 

app.post('/crawled-pages', (req, res) => {
    controlTasks(req.body.data.data, req.body.data.taskId);
    res.send();
});

 

server.listen(port, () => console.log('listening on port' + port));

