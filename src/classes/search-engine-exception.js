const AbstractException = require('./abstract-exception');

class SearchEngineException extends AbstractException
{
  constructor(searchEngine, message, data = null)
  {
    super(message, data);

    this.searchEngine = searchEngine;
  }
  toString() {

    return `[${this.searchEngine}] ${this.name}: ${this.message}`;
  }
}

module.exports = SearchEngineException;
