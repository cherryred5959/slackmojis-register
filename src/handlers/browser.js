const puppeteer = require('puppeteer');

module.exports = async (asyncFunction, information) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const page = await browser.newPage();

  await asyncFunction(page, information);

  await browser.close();
};
