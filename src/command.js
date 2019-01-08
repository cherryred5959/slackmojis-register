'use strict';

const {Signale} = require('signale');
const option = require('./prompts/option');
const browser = require('./puppeteer/browser');

module.exports = async () => {
  const signale = new Signale();

  try {
    switch (await option()) {
      case 'install':
        break;


    }

    //     await puppeteer(values);

  } catch (error) {
    signale.fatal(error);
  }
};