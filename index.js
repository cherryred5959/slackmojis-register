'use strict';

const { Signale } = require('signale');
const prompt = require('./src/prompt');
const puppeteer = require('./src/puppeteer');

(async () => {
    const signale = new Signale();

    try {
        const { values } = await prompt();
        await puppeteer(values);
    } catch (error) {
        signale.fatal(error);
    }

})();