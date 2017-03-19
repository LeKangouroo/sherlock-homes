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
    if (!(searchCriteria instanceof SearchCriteria))
    {
      throw new SearchEngineException('invalid argument. expected an instance of the SearchCriteria');
    }

    const args = [
      `--offer-types=${JSON.stringify(Offer.types)}`,
      `--search-criteria=${JSON.stringify(searchCriteria)}`,
      `--search-engine=${JSON.stringify(this)}`
    ];
    const searchEngineName = this.getName();
    const newOffersUrls = [];
    const offers = [];

    let scriptName;
    let childProcess;

    scriptName = `${searchEngineName}/get-urls`;
    childProcess = Casper.runScript(scriptName, args);
    childProcess.stdout.on('data', (buffer) => {

      const message = Casper.parseStreamBuffer(buffer);

      if (message === null)
      {
        return;
      }
      if (message.type === 'url')
      {
        if (SearchEngine.isOfferCached(message.data))
        {
          console.log('url is cached');
        }
        else
        {
          newOffersUrls.push(message.data);
        }
      }
    });
    childProcess.on('close', (code, signal) => {

      console.log(`script closed with exit code (${code}) with signal "${signal}"`);

      if (code !== 0)
      {
        throw new SearchEngineException(`error during execution of ${scriptName} script`);
      }
      args.push(`--urls=${JSON.stringify(newOffersUrls)}`);
      scriptName = `${searchEngineName}/get-offers`;
      childProcess = Casper.runScript(scriptName, args);
      childProcess.stdout.on('data', (buffer) => {

        const message = Casper.parseStreamBuffer(buffer);

        if (message === null)
        {
          return;
        }
        if (message.type === 'offer')
        {
          console.log('offer', message.data);
        }
      });
      childProcess.on('close', (code, signal) => {

        console.log(`script closed with exit code (${code}) with signal "${signal}"`);

        if (code !== 0)
        {
          throw new SearchEngineException(`error during execution of ${scriptName} script`);
        }
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
  static isOfferCached(url)
  {
    return false;
  }
  static isWebsiteUrlValid(url)
  {
    return (isString(url) && url.length > 0 && isUrl(url));
  }
}

module.exports = SearchEngine;
