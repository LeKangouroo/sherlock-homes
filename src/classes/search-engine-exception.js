const AbstractException = require('./abstract-exception');

class SearchEngineException extends AbstractException
{
  constructor(searchEngine, message, data = null)
  {
    super(message, data);

    this.searchEngine = searchEngine;
  }
  toString() {

    return `[${this.searchEngine.getName()}] ${this.name}: ${this.message}`;
  }
}

module.exports = SearchEngineException;
