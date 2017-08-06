const SearchEngine = require('./search-engine');

class LeBonCoinSearchEngine extends SearchEngine
{
  constructor()
  {
    super({
      name: 'leboncoin',
      websiteUrl: 'https://www.leboncoin.fr'
    });
  }
}

module.exports = LeBonCoinSearchEngine;
