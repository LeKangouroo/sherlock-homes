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
    return new Promise(async (resolve, reject) => {

      if (!(searchCriteria instanceof SearchCriteria))
      {
        return reject(new SearchEngineException(this, 'invalid argument. expected an instance of the SearchCriteria'));
      }

      const DEFAULT_OPTIONS = { args: null, interruptOnError: false };
      const opts = Object.assign({}, DEFAULT_OPTIONS, options);
      const createFail = ({ reject, options, notify }) => (error) => {

        notify('error', error);
        if (options.interruptOnError)
        {
          reject(error);
        }
      };
      const fail = createFail({ notify: this.notifyObservers.bind(this), reject: reject, options: opts });
      const cache = await Cache.getInstance();
      const defaultArgs = [
        `--offer-types=${JSON.stringify(Offer.types)}`,
        `--search-criteria=${JSON.stringify(searchCriteria)}`,
        `--search-engine=${JSON.stringify(this)}`
      ];
      const args = (Array.isArray(opts.args)) ? defaultArgs.concat(opts.args) : defaultArgs;
      const searchEngineName = this.getName();
      const newOffersUrls = [];
      const offers = [];
      const urlsCasperScript = new CasperScript(`${searchEngineName}/get-urls`, args);

      urlsCasperScript.addObserver("data", message => {

        if (message.type === "error")
        {
          fail(new SearchEngineException(this, "error during offers URLs parsing", message.data));
          return;
        }
        if (message.type === "urls")
        {
          const urls = message.data;

          this.notifyObservers("urls-found", urls);
          urls.forEach(async url => {

            let offer = await cache.findOfferByURL(url);

            if (offer.data === null)
            {
              newOffersUrls.push(url);
            }
            else
            {
              offer = new Offer(offer.data);
              this.notifyObservers("offer-found", offer);
              offers.push(offer);
            }
          });
        }
      });
      urlsCasperScript.addObserver("exit", code => {

        if (code !== 0)
        {
          fail(new SearchEngineException(this, "error during execution of get-urls CasperJS script"));
          return;
        }
        if (newOffersUrls.length === 0)
        {
          resolve(offers);
          return;
        }

        const offersCasperScript = new CasperScript(`${searchEngineName}/get-offers`, args.concat([`--urls=${JSON.stringify(newOffersUrls)}`]));

        offersCasperScript.addObserver("data", (message) => {

          if (message.type === "error")
          {
            fail(new SearchEngineException(this, "error during offer analysis", message.data));
            return;
          }
          if (message.type === "offer")
          {
            const offer = new Offer(message.data);

            cache.saveOffer(message.data);
            this.notifyObservers("offer-found", offer);
            offers.push(offer);
          }
        });
        offersCasperScript.addObserver("exit", code => {

          if (code !== 0)
          {
            fail(new SearchEngineException(this, 'error during execution of get-offers CasperJS script'));
            return;
          }
          resolve(offers);
        });
      });
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
