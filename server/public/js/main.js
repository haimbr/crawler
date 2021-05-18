const socket = io();



const startCrawlingButton = document.querySelector('#start-crawling');
const crawlingProgress = document.querySelector('.crawling-progress_container');
const resultsTable = document.querySelector('.results-table');
const currentDepth = document.querySelector('.current-depth p');
const crawledPages = document.querySelector('.crawled-pages p');

const resultsTree = {};
let pagesInCurrentDepth = {};
let pagesInNextDepth = {};
let count = 0;//** */
const urls = {}; // ***



socket.on('new-result', (data) => {
    console.log(data, count++);
    console.log(pagesInCurrentDepth);
    urls[data.url] = true;
    const currentUrl = pagesInCurrentDepth[data.url];
    currentUrl.title = data.title;
    currentUrl.depth = data.depth;
    currentUrl.links = [];
    data.links.forEach((link) => {
        if(!pagesInNextDepth[link]) pagesInNextDepth[link] = { url: link };
        currentUrl.links.push(pagesInNextDepth[link]);
    })
})


socket.on('start-crawling-next-depth', (data) => {
    console.log('start-crawling-next-depth');
    pagesInCurrentDepth = pagesInNextDepth;
    pagesInNextDepth = {};
})

socket.on('end-crawling', (data) => {
    console.log('end-crawling');
})

startCrawlingButton.addEventListener('click', async () => {
    const pageUrl = document.querySelector('#url').value;
    const maxDepth = document.querySelector('#max-depth').value;
    const maxPages = document.querySelector('#max-pages').value;
    if (pageUrl && maxDepth && maxPages) {
        resultsTree.root = { url: pageUrl };
        pagesInCurrentDepth[pageUrl] = resultsTree.root;
        socket.emit('start-crawling', { pageUrl, maxPages, maxDepth })
        updateUiWhenStartCrawling();
    }
})


function updateUiWhenStartCrawling() {
    startCrawlingButton.disabled = true;
    crawlingProgress.style.display = 'block';
    resultsTable.style.display = 'block';
    currentDepth.innerText = 0;
    crawledPages.innerText = 0;
    clearTable();
}

function createNewRow(data) {
    const table = document.querySelector('.results-table table');
    const newRow = createElement('tr', table);
    for (let key in data) {
        const TdElement = createElement('td', newRow)
        if (key === 'links') {
            const ulElement = createElement('ul', TdElement)
            data[key].forEach((link) => {
                createElement('li', ulElement, link)
            })
        } else {
            TdElement.innerText = decodeURI(data[key]);
        }
    }
}


function createElement(element, parent, data) {
    const newElement = document.createElement(element);
    parent.appendChild(newElement);
    if (data) {
        newElement.innerText = decodeURI(data);
    }
    return newElement;
}



function clearTable() {
    let trElementsArr = resultsTable.querySelectorAll('tr')
    for (let i = 1; i < trElementsArr.length; i++) {
        trElementsArr[i].remove();
    }
}
