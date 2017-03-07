const Casper = require('./casper');
const Offer = require('./offer');
const SearchEngine = require('./search-engine');
const SearchEngineException = require('./search-criteria-exception');

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

    return new Promise((resolve, reject) => {

      const args = [
        `--offer-types=${JSON.stringify(Offer.types)}`,
        `--search-criteria=${JSON.stringify(searchCriteria)}`,
        `--search-engine=${JSON.stringify(this)}`
      ];

      Casper.runScript('foncia-offers', args)
      .then((stdout) => {

        resolve(JSON.parse(stdout).map((o, i) => new Offer(o)));
      })
      .catch((stderr) => {

        reject(new SearchEngineException(`Error during Foncia offers searching: ${stderr}`));
      });
    });
  }
}

module.exports = FonciaSearchEngine;
