const cacheServerHost = require('./options/cache-server-host');
const cacheServerPort = require('./options/cache-server-port');

module.exports = {
  command: 'server',
  describe: 'Runs a webservice with a REST API',
  builder: {
    cacheServerHost: cacheServerHost,
    cacheServerPort: cacheServerPort,
    host: {
      default: 'localhost',
      describe: 'The host of the webservice',
      type: 'string'
    },
    port: {
      default: 8080,
      describe: 'The port exposed by the webservice',
      type: 'number'
    },
    'log-email': {
      default: false,
      describe: 'Enables email logging',
      type: 'boolean'
    },
    'log-email-from': {
      describe: 'The sender of the email for logging',
      type: 'string'
    },
    'log-email-host': {
      describe: 'The SMTP server host',
      type: 'string'
    },
    'log-email-port': {
      default: 587,
      describe: 'The SMTP server port',
      type: 'number'
    },
    'log-email-pass': {
      describe: 'The SMTP server password',
      type: 'string'
    },
    'log-email-to': {
      describe: 'The recipients of the email for logging',
      type: 'array'
    },
    'log-email-user': {
      describe: 'The SMTP server username',
      type: 'string'
    }
  }
};
