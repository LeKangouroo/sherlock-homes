const AbstractException = require('./abstract-exception');

class CacheException extends AbstractException
{
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
