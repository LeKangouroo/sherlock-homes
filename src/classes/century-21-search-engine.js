const Casper = require('./casper');
const Offer = require('./offer');
const Request = require('./request');
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

      const reqs = searchCriteria.zipCodes
        .map((zipCode) => (new Request(`https://www.century21.fr/autocomplete/localite/?q=${zipCode}`)).send());

      Promise
        .all(reqs)
        .then((responses) => {

          const zipCodes = responses
            .filter((response) => response.isOK())
            .map((response) => response.json())
            .filter((data) => data.length > 0)
            .map((data) => data[0]);

          if (zipCodes.length === 0)
          {
            throw new SearchEngineException('no matching zip code');
          }

          const args = [
            `--offer-types=${JSON.stringify(Offer.types)}`,
            `--search-criteria=${JSON.stringify(searchCriteria)}`,
            `--search-engine=${JSON.stringify(this)}`,
            `--zip-codes=${JSON.stringify(zipCodes)}`
          ];

          Casper.runScript('century-21-offers', args).then((stdout) => {

            // TODO: remove the console log and uncomment the commented line
            console.log(stdout);
            // resolve(JSON.parse(stdout).map((o, i) => new Offer(o)));
          })
          .catch((stderr) => reject(new SearchEngineException(`Error during Century 21 offers searching: ${stderr}`)));
        })
        .catch((error) => reject(new SearchEngineException(`error while retrieving zip codes autocomplete data: ${error.toString()}`)));
    });
  }
}

module.exports = Century21SearchEngine;
