const isString = require('lodash/isString');
const isUrl = require('validator/lib/isURL');
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
