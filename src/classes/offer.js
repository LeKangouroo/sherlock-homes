const isFinite = require('lodash/isFinite');
const isNumber = require('lodash/isNumber');
const isString = require('lodash/isString');
const isUrl = require('validator/lib/isURL');
const OfferException = require('./offer-exception');
const values = require('lodash/values');

const types = {
  PURCHASE: 101,
  RENT: 100
};

class Offer
{
  constructor(options)
  {
    const DEFAULT_OPTIONS = {
      agencyFees: null,
      price: null,
      surfaceArea: null,
      type: null,
      url: null,
      zipCode: null
    };
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);

    if (!Offer.areAgencyFeesValid(opts.agencyFees))
    {
      throw new OfferException('invalid agency fees');
    }
    if (!Offer.isPriceValid(opts.price))
    {
      throw new OfferException('invalid price');
    }
    if (!Offer.isSurfaceAreaValid(opts.surfaceArea))
    {
      throw new OfferException('invalid surface area');
    }
    if (!Offer.isTypeValid(opts.type))
    {
      throw new OfferException('invalid type');
    }
    if (!Offer.isUrlValid(opts.url))
    {
      throw new OfferException('invalid url');
    }
    if (!Offer.isZipCodeValid(opts.zipCode))
    {
      throw new OfferException('invalid zip code');
    }
    this.agencyFees = opts.agencyFees;
    this.price = opts.price;
    this.surfaceArea = opts.surfaceArea;
    this.type = opts.type;
    this.url = opts.url;
    this.zipCode = opts.zipCode;
  }
  getAgencyFees()
  {
    return this.agencyFees;
  }
  getPrice()
  {
    return this.price;
  }
  getSurfaceArea()
  {
    return this.surfaceArea;
  }
  getType()
  {
    return this.type;
  }
  getUrl()
  {
    return this.url;
  }
  getZipCode()
  {
    return this.zipCode;
  }
  static areAgencyFeesValid(agencyFees)
  {
    return (isNumber(agencyFees) && isFinite(agencyFees) && agencyFees >= 0);
  }
  static isPriceValid(price)
  {
    return (isNumber(price) && isFinite(price) && price > 0);
  }
  static isSurfaceAreaValid(surfaceArea)
  {
    return (isNumber(surfaceArea) && isFinite(surfaceArea) && surfaceArea > 0);
  }
  static isTypeValid(type)
  {
    return (values(types).indexOf(type) > -1);
  }
  static isUrlValid(url)
  {
    return (isString(url) && url.length > 0 && isUrl(url));
  }
  static isZipCodeValid(zipCode)
  {
    return (isString(zipCode) && zipCode.length > 0);
  }
  static get types()
  {
    return types;
  }
}

module.exports = Offer;
