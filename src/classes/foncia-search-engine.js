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

    const args = [
      `--search-criteria=${JSON.stringify(searchCriteria)}`,
      `--search-engine=${JSON.stringify(this)}`
    ];

    Casper.runScript('foncia-rent-offers', args)
      .then((stdout) => console.log('output', stdout))
      .catch((stderr) => console.error('error', stderr));
  }
}

module.exports = FonciaSearchEngine;
