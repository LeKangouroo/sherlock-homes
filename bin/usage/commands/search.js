module.exports = {
  command: 'search',
  describe: 'Runs a search',
  builder: {
    'cache-server-host': require('./options/cache-server-host'),
    'cache-server-port': require('./options/cache-server-port'),
    'delimiter': require('./options/delimiter'),
    'format': require('./options/format'),
    'max-price': require('./options/max-price'),
    'min-surface': require('./options/min-surface'),
    'offer-type': require('./options/offer-type'),
    'zip-codes': require('./options/zip-codes')
  }
};
