const AbstractException = require('./abstract-exception');

class CacheException extends AbstractException
{
  // TODO: refactor this part using AbstractException.data property
  constructor(message, cause = null)
  {
    super(message);
    this.cause = cause;
  }
  getCause()
  {
    return this.cause;
  }
}

module.exports = CacheException;
