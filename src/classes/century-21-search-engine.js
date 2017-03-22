const Cache = require('./cache');
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
      name: 'century-21',
      websiteUrl: 'https://www.century21.fr'
    });
  }
  findOffers(searchCriteria)
  {
    return new Promise((resolve, reject) => {

      Cache
        .getInstance()
        .then((cache) => {

          const zipCodeFetchSteps = searchCriteria.zipCodes.map((zipCode) => new Promise((resolve, reject) => {

            const cacheKey = `century21:zipCode:${zipCode}`;

            cache
              .getData(cacheKey)
              .then((record) => {

                if (record.data !== null)
                {
                  return resolve(record.data);
                }

                const req = new Request(`https://www.century21.fr/autocomplete/localite/?q=${zipCode}`);

                req
                  .send()
                  .then((response) => {

                    if (!response.isOK())
                    {
                      return reject(new SearchEngineException('Unexpected response from Century 21 autocomplete webservice'));
                    }

                    const results = response.json();

                    if (results.length > 0)
                    {
                      const data = results[results.length - 1];

                      cache.setData(cacheKey, JSON.stringify(data));
                      resolve(data);
                    }
                  })
                  .catch((error) => reject(error));
              })
              .catch((error) => reject(error));
          }));

          Promise
            .all(zipCodeFetchSteps)
            .then((zipCodes) => {

              if (zipCodes.length === 0)
              {
                throw new SearchEngineException('no matching zip code');
              }
              super
                .findOffers(searchCriteria, { args: [`--zip-codes=${JSON.stringify(zipCodes)}`] })
                .then((offers) => resolve(offers))
                .catch((error) => reject(error));
            })
            .catch((error) => {

              reject(new SearchEngineException(`error while retrieving zip codes autocomplete data: ${error.toString()}`))
            });
        });
    });
  }
}

module.exports = Century21SearchEngine;
