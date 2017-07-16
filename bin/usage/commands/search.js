const cacheServerHost = require('./options/cache-server-host');
const cacheServerPort = require('./options/cache-server-port');

module.exports = {
  command: 'search',
  describe: 'Runs a search',
  builder: {
    'cache-server-host': cacheServerHost,
    'cache-server-port': cacheServerPort,
    'delimiter': {
      default: ';',
      demand: true,
      type: 'string'
    },
    'format': {
      choices: ['json', 'csv'],
      default: 'json',
      demand: true,
      type: 'string'
    },
    'max-price': {
      demand: true,
      describe: 'The maximum price',
      type: 'number'
    },
    'min-surface': {
      demand: true,
      describe: 'The minimum surface area',
      type: 'number'
    },
    'offer-type': {
      choices: ['rent', 'purchase'],
      demand: true,
      describe: 'The type of offer to search',
      type: 'string'
    },
    'zip-codes': {
      demand: true,
      describe: 'A list of zip codes',
      type: 'array'
    }
  }
};
