const Cache = require('./cache');
const Request = require('./request');
const SearchEngine = require('./search-engine');
const SearchEngineException = require('./search-engine-exception');

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

                Century21SearchEngine.findZipCodeAutocomplete(zipCode).then((data) => {

                  cache.setData(cacheKey, JSON.stringify(data));
                  resolve(data);
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
                throw new SearchEngineException(this, `no matching zip code for values = ${searchCriteria.zipCodes.join(', ')}`);
              }
              super
                .findOffers(searchCriteria, { args: [`--zip-codes=${JSON.stringify(zipCodes)}`] })
                .then((offers) => resolve(offers))
                .catch((error) => reject(error));
            })
            .catch((error) => {

              reject(new SearchEngineException(this, 'error while retrieving zip codes autocomplete data', error))
            });
        });
    });
  }

  static findZipCodeAutocomplete(zipCode)
  {
    return new Promise((resolve, reject) => {

      const req = new Request(`https://www.century21.fr/autocomplete/localite/?q=${zipCode}`);

      req
      .send()
      .then((response) => {

        if (!response.isOK())
        {
          return reject(new SearchEngineException(this, 'Unexpected response from Century 21 autocomplete webservice'));
        }

        const results = response.json();

        if (Array.isArray(results) && results.length > 0)
        {
          return resolve(results[results.length - 1]);
        }
        resolve(null);
      })
      .catch((error) => reject(error));
    });
  }
}

module.exports = Century21SearchEngine;
