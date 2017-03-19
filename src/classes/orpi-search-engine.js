const SearchEngine = require('./search-engine');

class OrpiSearchEngine extends SearchEngine
{
  constructor()
  {
    super({
      name: 'orpi',
      websiteUrl: 'https://www.orpi.com'
    });
  }
}

module.exports = OrpiSearchEngine;
