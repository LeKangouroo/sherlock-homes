const Casper = require('./casper');
const Offer = require('./offer');
const SearchEngine = require('./search-engine');

class FonciaSearchEngine extends SearchEngine
{
  constructor()
  {
    super({
      name: 'Foncia',
      websiteUrl: 'https://fr.foncia.com'
    });
  }
  findOffers(searchCriteria)
  {
    super.findOffers(searchCriteria);

    const args = [
      `--offer-types=${JSON.stringify(Offer.types)}`,
      `--search-criteria=${JSON.stringify(searchCriteria)}`,
      `--search-engine=${JSON.stringify(this)}`
    ];

    Casper.runScript('foncia-rent-offers', args)
      .then((stdout) => console.log('output', stdout))
      .catch((stderr) => console.error('error', stderr));
  }
}

module.exports = FonciaSearchEngine;
