const SearchEngine = require('./search-engine');

class FonciaSearchEngine extends SearchEngine
{
  constructor()
  {
    super({
      name: 'foncia',
      websiteUrl: 'https://fr.foncia.com'
    });
  }
}

module.exports = FonciaSearchEngine;
