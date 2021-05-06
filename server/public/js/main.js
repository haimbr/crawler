const socket = io();


socket.on('message', (message) => {
    console.log(message);
})


const startButton = document.querySelector('#start-crawling');

startButton.addEventListener('click', async () => {
    const pageUrl = document.querySelector('#url').value;
    const maxDepth = document.querySelector('#max-depth').value;
    const maxPages = document.querySelector('#max-pages').value;
    socket.emit('start-crawling', { pageUrl, maxPages, maxDepth })
})