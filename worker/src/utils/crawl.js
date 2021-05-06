const puppeteer = require('puppeteer');
const axios = require('axios');

const { getTasksFromSqs, deleteTasksFromSqs } = require('./sqs')



const sendResultsToServer = async (data) => {
    const URL = 'http://localhost:3000/crawled-pages';
    try {
        await axios.post(URL, { data })
    } catch (err) {
        console.log(err);
    }
}




const crawlDate = async (page, url) => {
    try {
        await page.goto(url);
        const result = await page.evaluate(() => {
            const anchors = [...document.querySelectorAll('a')];
            const links = [...new Set(anchors.map(url => url.href))];
            // const links = [...new Set(anchors.map(url => url.href).filter(link => link.includes('http')))];
            const title = document.querySelector('title')?.innerText;
            return { links, title };
        });
        return result;
    } catch (err) {
        console.log(err)
        return { links: [], title: 'broken link' };
    }
}

const crawlerFunc = async () => {
    let tasks = await getTasksFromSqs();
    if (tasks.length === 0){
        tasks = await getTasksFromSqs();
        console.log(tasks);
        if (tasks.length === 0) return;
    }

    console.log(tasks)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let i = 0; i < tasks.length; i++) {
        let result = await crawlDate(page, tasks[i].Body);
        sendResultsToServer({taskId: tasks[i].MessageAttributes.taskId.StringValue, data: {url: tasks[i].Body, ...result} });
        deleteTasksFromSqs(tasks[i])
        if (i === tasks.length - 1) await browser.close()
    }
    crawlerFunc();
}




module.exports = { crawlerFunc };