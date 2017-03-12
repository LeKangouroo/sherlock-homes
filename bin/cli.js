#!/usr/bin/env node

const usage = require('./usage/usage');
const argv = usage.argv;
const cmd = (typeof argv._[0] === 'string') ? argv._[0] : null;

if (!cmd)
{
  usage.showHelp();
  process.exit(1);
}
require(`./scripts/${cmd}`);
