const AbstractObservable = require('./abstract-observable');
const Cache = require('./cache');
const CasperScript = require('./casper-script');
const isString = require('lodash/isString');
const isUrl = require('validator/lib/isURL');
const Offer = require('./offer');
const SearchCriteria = require('./search-criteria');
const SearchEngineException = require('./search-engine-exception');

class SearchEngine extends AbstractObservable
{
  constructor(options)
  {
    super();

    const DEFAULT_OPTIONS = {
      name: '',
      websiteUrl: ''
    };
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);

    if (this.constructor.name === 'SearchEngine')
    {
      throw new SearchEngineException(this, 'SearchEngine class cannot be instantiated as a concrete class');
    }
    if (!SearchEngine.isNameValid(opts.name))
    {
      throw new SearchEngineException(this, 'invalid search engine name');
    }
    if (!SearchEngine.isWebsiteUrlValid(opts.websiteUrl))
    {
      throw new SearchEngineException(this, 'invalid search engine website url');
    }
    this.name = opts.name;
    this.websiteUrl = opts.websiteUrl;
  }
  findOffers(searchCriteria, options = {})
  {
    return new Promise((resolve, reject) => {

      if (!(searchCriteria instanceof SearchCriteria))
      {
        return reject(new SearchEngineException(this, 'invalid argument. expected an instance of the SearchCriteria'));
      }

      const DEFAULT_OPTIONS = {
        args: null,
        interruptOnError: true,
        outputErrors: true
      };

      options = Object.assign({}, DEFAULT_OPTIONS, options);

      let fail = function(reject, options, notify, error) {

        notify('error', error);
        if (options.outputErrors)
        {
          console.error(error);
        }
        if (options.interruptOnError)
        {
          reject(error);
        }

      };

      fail = fail.bind(null, reject, options, this.notifyObservers.bind(this));

      Cache
        .getInstance()
        .then((cache) => {

          const defaultArgs = [
            `--offer-types=${JSON.stringify(Offer.types)}`,
            `--search-criteria=${JSON.stringify(searchCriteria)}`,
            `--search-engine=${JSON.stringify(this)}`
          ];
          const args = (Array.isArray(options.args)) ? defaultArgs.concat(options.args) : defaultArgs;
          const searchEngineName = this.getName();
          const newOffersUrls = [];
          const offers = [];
          const urlsCasperScript = new CasperScript(`${searchEngineName}/get-urls`, args);

          urlsCasperScript.addObserver('data', (message) => {

            if (message === null)
            {
              return;
            }
            if (message.type === 'error')
            {
              return fail(new SearchEngineException(this, 'error during offers URLs parsing', message.data));
            }
            if (message.type === 'urls')
            {
              const urls = message.data;

              this.notifyObservers('urls-found', urls);
              urls.forEach(url => {

                cache
                  .findOfferByURL(url)
                  .then((offer) => {

                    if (offer.data === null)
                    {
                      newOffersUrls.push(url);
                    }
                    else
                    {
                      offer = new Offer(offer.data);
                      this.notifyObservers('offer-found', offer);
                      offers.push(offer);
                    }
                  })
                  .catch((error) => fail(error));
              });
            }
          });
          urlsCasperScript.addObserver('exit', (code) => {

            if (code !== 0)
            {
              return fail(new SearchEngineException(this, 'error during execution of get-urls CasperJS script'));
            }
            if (newOffersUrls.length === 0)
            {
              return resolve(offers);
            }

            args.push(`--urls=${JSON.stringify(newOffersUrls)}`);

            const offersCasperScript = new CasperScript(`${searchEngineName}/get-offers`, args);

            offersCasperScript.addObserver('data', (message) => {

              if (message === null)
              {
                return;
              }
              if (message.type === 'error')
              {
                return fail(new SearchEngineException(this, 'error during offer analysis', message.data));
              }
              if (message.type === 'offer')
              {
                cache.saveOffer(message.data);

                let offer = new Offer(message.data);

                this.notifyObservers('offer-found', offer);
                offers.push(offer);
              }
            });
            offersCasperScript.addObserver('exit', (code) => {

              if (code !== 0)
              {
                return fail(new SearchEngineException(this, 'error during execution of get-offers CasperJS script'));
              }
              return resolve(offers);
            });
          });
        })
        .catch((error) => fail(error));
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
