const socket = io();



const startCrawlingButton = document.querySelector('#start-crawling');
const crawlingProgress = document.querySelector('.crawling-progress_container');
const resultsTable = document.querySelector('.results-table');
const currentDepth = document.querySelector('.current-depth p');
const crawledPages = document.querySelector('.crawled-pages p');




socket.on('new-result', (data) => {
    if(data.endTask){
        setTimeout(()=>{
            alert('ended crawling')
        },100)
        startCrawlingButton.disabled = false;
    }else{
        crawledPages.innerText++;
        currentDepth.innerText = data.depth;
        createNewRow(data);
    }
})




startCrawlingButton.addEventListener('click', async () => {
    const pageUrl = document.querySelector('#url').value;
    const maxDepth = document.querySelector('#max-depth').value;
    const maxPages = document.querySelector('#max-pages').value;
    if (pageUrl && maxDepth && maxPages) {
        socket.emit('start-crawling', { pageUrl, maxPages, maxDepth })
        updateUiWhenStartCrawling();
    }
})


function updateUiWhenStartCrawling(){
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
        if(key === 'links'){
            const ulElement = createElement('ul',TdElement )
            data[key].forEach((link) =>{
                createElement('li',ulElement, link )
            })
        }else{
            TdElement.innerText = decodeURI(data[key]);
        }
    }
}


function createElement(element, parent, data) {
    const newElement = document.createElement(element);
    parent.appendChild(newElement);
    if(data){
        newElement.innerText = decodeURI(data);
    }
    return newElement;
}



function clearTable(){
    let trElementsArr = resultsTable.querySelectorAll('tr')
    for(let i=1; i<trElementsArr.length; i++){
        trElementsArr[i].remove();
    }
}
