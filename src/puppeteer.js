'use strict';

const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');
const slack = require('./slack');

module.exports = async (
    {
        workspace,
        email,
        password,
        prefix,
        path,
    }
) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    try {
        const page = await browser.newPage();
        await page.goto('https://slackmojis.com', {
            waitUntil: 'domcontentloaded',
        });

        const images = await page.evaluate(() => {
            const emojis = document.querySelectorAll('ul.emojis > .emoji');

            let images = [];
            for (let emoji of emojis) {
                const imgTag = emoji.querySelector('img');

                const nameTag = emoji.querySelector('.name');
                const nameTagInnerText = nameTag.innerText;

                const emojiGroup = emoji.parentNode.parentNode.querySelector('.title').innerText.toLowerCase();
                const [, emojiName] = nameTagInnerText.split(':');

                images.push({
                    url: imgTag.getAttribute('src'),
                    name: `${emojiGroup}_${emojiName}`.replace(/ /g, "_").replace(/-/g, "_"),
                });
            }

            return images;
        });

        const workspaceUrl = slack(workspace);
        await page.goto(`${workspaceUrl}/customize/emoji`);
        await page.waitForSelector('input#email, input#password, button#signin_btn');
        await page.evaluate((email, password) => {
            document.querySelector('input#email').value = email;
            document.querySelector('input#password').value = password;
            document.querySelector('button#signin_btn').click();
        }, email, password);

        await page.waitForNavigation();
        await page.waitForSelector('button.p-customize_emoji_wrapper__custom_button');

        for (let image of images) {
            const response = await fetch(image.url);
            const [fileName] = response.url.split('/').slice(-1).pop().split('?');

            if (!response.ok) {
                continue;
            }

            const fileFullPath = `${path}/${fileName}`;
            await fs.writeFileSync(fileFullPath, Buffer.from(await response.arrayBuffer()));

            await page.click('button.p-customize_emoji_wrapper__custom_button');
            await page.waitForSelector('input#emojiimg, input#emojiname, button.c-dialog__go');

            const fileInput = await page.$('input#emojiimg');
            await fileInput.uploadFile(fileFullPath);

            await page.type('input#emojiname', `${prefix}_${image.name}`);

            await Promise.all([
                page.waitForResponse(response => {
                    const [url] = response.url().split('?');
                    return url === `${workspaceUrl}/api/emoji.add`;
                }),
                page.evaluate(() => {
                    document.querySelector('button.c-dialog__go').removeAttribute('disabled');
                    document.querySelector('button.c-dialog__go').click();
                }),
                page.waitFor(() => !document.querySelector(".ReactModalPortal")),
            ]);
        }
    } catch (error) {
        throw error;
    } finally {
        await browser.close();
    }
};