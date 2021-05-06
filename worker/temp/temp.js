const puppeteer = require('puppeteer');

temp()

async function temp() {
    const url = 'https://he.wikipedia.org/wiki/%D7%A2%D7%9E%D7%95%D7%93_%D7%A8%D7%90%D7%A9%D7%99'
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const result = await page.evaluate(() => {
            const anchors = [...document.querySelectorAll('a')];
            const links = [...new Set(anchors.map(url => url.href).filter(link => link.includes('http')))];
            const title = document.querySelector('title').innerText;
            return { links, title };
        });
        await browser.close()
        console.log(result);
    } catch (err) {
        console.log(err)
        console.log({ links: [], title: 'broken link' });
    }
    
}