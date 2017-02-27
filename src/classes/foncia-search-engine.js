const Casper = require('./casper');
const SearchEngine = require('./search-engine');

class FonciaSearchEngine extends SearchEngine
{
  constructor(options)
  {
    super(options);
  }
  findOffers(searchCriteria)
  {
    super.findOffers(searchCriteria);

    Casper.runScript('foncia-rent-offers')
      .then((stdout) => console.log('output', stdout))
      .catch((stderr) => console.error('error', stderr));
  }
}

module.exports = FonciaSearchEngine;
