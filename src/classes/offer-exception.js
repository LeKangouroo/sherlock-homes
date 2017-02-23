const AbstractException = require('./abstract-exception');

class OfferException extends AbstractException
{
  constructor(message)
  {
    super(message);
  }
}

module.exports = OfferException;
