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

    if (!SearchCriteria.validateMaxPrice(opts.maxPrice))
    {
      throw new SearchCriteriaException('invalid max price option');
    }
  }
  static validateMaxPrice(maxPrice)
  {
    return (isNumber(maxPrice) && isFinite(maxPrice) && maxPrice >= 0);
  }
}

module.exports = SearchCriteria;
