const AbstractException = require('./abstract-exception');

class SearchEngineException extends AbstractException
{
  constructor(message)
  {
    super(message);
  }
}

module.exports = SearchEngineException;
