const AbstractException = require('./abstract-exception');

class ResponseException extends AbstractException
{
  constructor(message)
  {
    super(message);
  }
}

module.exports = ResponseException;
