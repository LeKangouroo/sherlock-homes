const AbstractException = require('./abstract-exception');

class SearchCriteriaException extends AbstractException
{
  constructor(message)
  {
    super(message);
  }
}

module.exports = SearchCriteriaException;
