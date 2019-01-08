const commands = require('./commands');
const handlers = require('./handlers');

const options = {
  install: {
    command: commands.installCommand,
    handler: handlers.installHandler,
  },
};

module.exports = options;
