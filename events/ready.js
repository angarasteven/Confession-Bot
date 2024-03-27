const chalk = require('chalk');
module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`${chalk.green('✓')} Logged in as ${chalk.yellow(client.user.tag)}`);
  },
};