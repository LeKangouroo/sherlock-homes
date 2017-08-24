module.exports = {
  command: 'server',
  describe: 'Runs a webservice with a REST API',
  builder: {
    'cache-server-host': require('./options/cache-server-host'),
    'cache-server-port': require('./options/cache-server-port'),
    'host': require('./options/host'),
    'log-email': require('./options/log-email'),
    'log-email-from': require('./options/log-email-from'),
    'log-email-host': require('./options/log-email-host'),
    'log-email-pass': require('./options/log-email-pass'),
    'log-email-port': require('./options/log-email-port'),
    'log-email-to': require('./options/log-email-to'),
    'log-email-user': require('./options/log-email-user'),
    'port': require('./options/port')
  }
};
