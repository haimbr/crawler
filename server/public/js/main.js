const socket = io();



const startCrawlingButton = document.querySelector('#start-crawling');
const crawlingProgress = document.querySelector('.crawling-progress_container');
const resultsTable = document.querySelector('.results-table');
const currentDepth = document.querySelector('.current-depth p');
const crawledPages = document.querySelector('.crawled-pages p');


const urls = {};



socket.on('new-result', (data) => {
    crawledPages.innerText++;
    currentDepth.innerText = data.depth;
    urls[data.url] = data;
    if (resultsTable.children.length === 1) {
        createNode(data, 0);
    }
})



socket.on('end-crawling', (data) => {
    alert('end crawling')
    startCrawlingButton.disabled = false;
})



const createNode = (data, depth) => {
    const container = createElement('div', resultsTable, undefined, 'node-container');
    // add x-icon if this is not the first node
    if (document.querySelectorAll('.node-container').length !== 1) {
        const icon = createElement('span', container, 'X', 'x-icon');
        icon.addEventListener('click', (event) => clearOtherChildren(event.target.parentNode.previousElementSibling));
    }

    createElement('h3', container, `url: ${decodeURI(data.url)}`);
    createElement('h3', container, `title: ${data.title}`);
    createElement('h3', container, `depth: ${depth}`);
    const linksButton = createElement('h3', container, 'links', 'links-button');
    const urlsList = createElement('ul', container, undefined, 'links-list');
    data.links.forEach((link) => {
        createElement('li', urlsList, decodeURI(link), 'link');
    });


    linksButton.addEventListener('click', () => {
        if (urlsList.style.display === 'inline-block') {
            urlsList.style.display = 'none'
        } else {
            urlsList.style.display = 'inline-block'
        }
    });
    [...urlsList.children].forEach((element) => {
        element.addEventListener('click', (event) => {
            onClickUrl(event);
        });
    });
    window.scrollTo(0, document.body.scrollHeight);
};


const clearOtherChildren = (node) => {
    while (node.nextElementSibling?.classList.contains('node-container')) {
        node.nextElementSibling.remove();
    }
}

const onClickUrl = (event) => {
    const depth = document.querySelectorAll('.node-container').length;
    if (urls[event.target.innerText] && depth <= document.querySelector('#max-depth').value) {
        clearOtherChildren(event.target.parentNode.parentNode);
        createNode(urls[event.target.innerText], depth);
    } else {
        alert('this url has not been crawled');
    }
}

function createElement(element, parent, data, className) {
    const newElement = document.createElement(element);
    parent.appendChild(newElement);
    if (data) {
        newElement.innerText = data;
    } if (className) {
        newElement.classList.add(className);
    }
    return newElement;
}




startCrawlingButton.addEventListener('click', async () => {
    const pageUrl = document.querySelector('#url').value;
    const maxDepth = document.querySelector('#max-depth').value;
    const maxPages = document.querySelector('#max-pages').value;
    if (pageUrl && maxDepth && maxPages) {
        socket.emit('start-crawling', { pageUrl, maxPages, maxDepth })
        updateUiWhenStartCrawling(pageUrl);
    }
})


function updateUiWhenStartCrawling(url) {
    while (resultsTable.firstChild) {
        resultsTable.firstChild.remove();
    };
    startCrawlingButton.disabled = true;
    crawlingProgress.style.display = 'block';
    resultsTable.style.display = 'block';
    currentDepth.innerText = 0;
    crawledPages.innerText = 0;
    const container = document.querySelector('.results-table');
    createElement('h1', container, url, 'root-url');
}




