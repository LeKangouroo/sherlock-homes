const isFinite = require('lodash/isFinite');
const isNumber = require('lodash/isNumber');
const isString = require('lodash/isString');
const SearchCriteriaException = require('./search-criteria-exception');

class SearchCriteria
{
  constructor(options)
  {
    const DEFAULT_OPTIONS = {
      maxPrice: 0,
      minSurfaceArea: 0,
      zipCodes: []
    };
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);

    if (!SearchCriteria.isMaxPriceValid(opts.maxPrice))
    {
      throw new SearchCriteriaException('invalid max price option');
    }
    if (!SearchCriteria.isMinSurfaceAreaValid(opts.minSurfaceArea))
    {
      throw new SearchCriteriaException('invalid min surface area');
    }
    if (!Array.isArray(opts.zipCodes))
    {
      throw new SearchCriteriaException('zip codes are not stored in a array');
    }
    opts.zipCodes.forEach((zipCode, index) => {

      if (!SearchCriteria.isZipCodeValid(zipCode))
      {
        throw new SearchCriteriaException(`invalid zip code at index ${index}. Given value = ${zipCode}`);
      }
    });
    this.maxPrice = opts.maxPrice;
    this.minSurfaceArea = opts.minSurfaceArea;
    this.zipCodes = opts.zipCodes;
  }
  getMaxPrice()
  {
    return this.maxPrice;
  }
  getMinSurfaceArea()
  {
    return this.minSurfaceArea;
  }
  getZipCodes()
  {
    return this.zipCodes;
  }
  static isMaxPriceValid(maxPrice)
  {
    return (isNumber(maxPrice) && isFinite(maxPrice) && maxPrice > 0);
  }
  static isMinSurfaceAreaValid(minSurfaceArea)
  {
    return (isNumber(minSurfaceArea) && isFinite(minSurfaceArea) && minSurfaceArea > 0);
  }
  static isZipCodeValid(zipCode)
  {
    return (isString(zipCode) && zipCode.length > 0);
  }
}

module.exports = SearchCriteria;
