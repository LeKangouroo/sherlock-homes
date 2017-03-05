const Casper = require('./casper');
const Offer = require('./offer');
const SearchEngine = require('./search-engine');
const SearchEngineException = require('./search-criteria-exception');

class OrpiSearchEngine extends SearchEngine
{
  constructor()
  {
    super({
      name: 'ORPI',
      websiteUrl: 'https://www.orpi.com'
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

      Casper.runScript('orpi-offers', args)
      .then((stdout) => {

        resolve(JSON.parse(stdout));
      })
      .catch((stderr) => {

        reject(new SearchEngineException(`Error during ORPI offers searching: ${stderr}`));
      });
    });
  }
}

module.exports = OrpiSearchEngine;
