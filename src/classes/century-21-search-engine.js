const Casper = require('./casper');
const Offer = require('./offer');
const SearchEngine = require('./search-engine');
const SearchEngineException = require('./search-criteria-exception');

class Century21SearchEngine extends SearchEngine
{
  constructor()
  {
    super({
      name: 'Century 21',
      websiteUrl: 'https://www.century21.fr'
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

      Casper.runScript('century-21-offers', args)
      .then((stdout) => {

        // TODO: remove the console log and uncomment the commented line
        console.log(stdout);
        // resolve(JSON.parse(stdout).map((o, i) => new Offer(o)));
      })
      .catch((stderr) => {

        reject(new SearchEngineException(`Error during Century 21 offers searching: ${stderr}`));
      });
    });
  }
}

module.exports = Century21SearchEngine;
