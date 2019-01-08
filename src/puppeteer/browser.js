'use strict';

const puppeteer = require('puppeteer');

module.exports = async (callback) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    const page = await browser.newPage();
    callback(page);
  } catch (error) {
    throw new error;
  } finally {
    browser.close();
  }
};