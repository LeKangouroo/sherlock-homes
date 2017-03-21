const Cache = require('./cache');
const Casper = require('./casper');
const isString = require('lodash/isString');
const isUrl = require('validator/lib/isURL');
const Offer = require('./offer');
const SearchCriteria = require('./search-criteria');
const SearchEngineException = require('./search-engine-exception');

class SearchEngine
{
  constructor(options)
  {
    const DEFAULT_OPTIONS = {
      name: '',
      websiteUrl: ''
    };
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);

    if (this.constructor.name === 'SearchEngine')
    {
      throw new SearchEngineException('SearchEngine class cannot be instantiated as a concrete class');
    }
    if (!SearchEngine.isNameValid(opts.name))
    {
      throw new SearchEngineException('invalid search engine name');
    }
    if (!SearchEngine.isWebsiteUrlValid(opts.websiteUrl))
    {
      throw new SearchEngineException('invalid search engine website url');
    }
    this.name = opts.name;
    this.websiteUrl = opts.websiteUrl;
  }
  findOffers(searchCriteria)
  {
    return new Promise((resolve, reject) => {

      if (!(searchCriteria instanceof SearchCriteria))
      {
        return reject(new SearchEngineException('invalid argument. expected an instance of the SearchCriteria'));
      }
      Cache
        .getInstance()
        .then((cache) => {

          const args = [
            `--offer-types=${JSON.stringify(Offer.types)}`,
            `--search-criteria=${JSON.stringify(searchCriteria)}`,
            `--search-engine=${JSON.stringify(this)}`
          ];
          const searchEngineName = this.getName();
          const newOffersUrls = [];
          const offers = [];
          const childProcess1 = Casper.runScript(`${searchEngineName}/get-urls`, args);

          childProcess1.stdout.on('data', (buffer) => {

            const message = Casper.parseStreamBuffer(buffer);

            if (message === null)
            {
              return;
            }
            if (message.type === 'url')
            {
              const url = message.data;

              cache
                .findOfferByURL(url)
                .then((offer) => {

                  if (offer.data === null)
                  {
                    newOffersUrls.push(url);
                  }
                  else
                  {
                    offers.push(new Offer(offer.data));
                  }
                });
            }
          });
          childProcess1.on('exit', (code) => {

            if (code !== 0)
            {
              return reject(new SearchEngineException(`error during execution of get-urls CasperJS script in ${this.getName()} class`));
            }

            args.push(`--urls=${JSON.stringify(newOffersUrls)}`);

            if (newOffersUrls.length === 0)
            {
              return resolve(offers);
            }

            const childProcess2 = Casper.runScript(`${searchEngineName}/get-offers`, args);

            childProcess2.stdout.on('data', (buffer) => {

              const message = Casper.parseStreamBuffer(buffer);

              if (message === null)
              {
                return;
              }
              if (message.type === 'offer')
              {
                cache.saveOffer(message.data);
                offers.push(new Offer(message.data));
              }
            });
            childProcess2.on('exit', (code) => {

              if (code !== 0)
              {
                return reject(new SearchEngineException(`error during execution of get-offers CasperJS script in ${this.getName()} class`));
              }
              return resolve(offers);
            });
          });
        })
        .catch((error) => reject(error));
    });
  }
  getName()
  {
    return this.name;
  }
  getWebsiteUrl()
  {
    return this.websiteUrl;
  }
  static isNameValid(name)
  {
    return (isString(name) && name.length > 0);
  }
  static isWebsiteUrlValid(url)
  {
    return (isString(url) && url.length > 0 && isUrl(url));
  }
}

module.exports = SearchEngine;
