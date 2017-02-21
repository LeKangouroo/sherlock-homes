const isFinite = require('lodash/isFinite');
const isNumber = require('lodash/isNumber');
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
  }
  static isMaxPriceValid(maxPrice)
  {
    return (isNumber(maxPrice) && isFinite(maxPrice) && maxPrice > 0);
  }
  static isMinSurfaceAreaValid(minSurfaceArea)
  {
    return (isNumber(minSurfaceArea) && isFinite(minSurfaceArea) && minSurfaceArea > 0);
  }
}

module.exports = SearchCriteria;
