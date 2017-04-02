const AbstractException = require('./abstract-exception');

class SearchEngineException extends AbstractException
{
  constructor(searchEngine, message, stack = null)
  {
    super(message, stack);

    this.searchEngine = searchEngine;
  }
  toString() {

    return `[${this.searchEngine}] ${this.name}: ${this.message}`;
  }
}

module.exports = SearchEngineException;
