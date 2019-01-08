const { Select } = require('enquirer');
const options = require('./option');

module.exports = async () => {
  const prompt = new Select({
    name: 'option',
    message: 'What do you want to start?',
    choices: Object.keys(options),
  });

  const selectedOption = await prompt.run();

  const { values } = await options[selectedOption].command();

  return options[selectedOption].handler(values);
};
