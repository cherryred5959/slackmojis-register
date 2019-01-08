'use strict';

const prompt = require('./src/prompt');
const puppeteer = require('./src/puppeteer');

(async () => {
  const { values } = await prompt();
  await puppeteer(values);
})();