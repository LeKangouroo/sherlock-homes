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
  }
}

module.exports = FonciaSearchEngine;
