'use strict';

const {Select} = require('enquirer');

module.exports = async () => {
  const prompt = new Select({
    name: 'option',
    message: 'What do you want to start?',
    choices: [
      'install',
      'fresh',
      'download',
      'clear',
    ],
  });

  return await prompt.run();
};