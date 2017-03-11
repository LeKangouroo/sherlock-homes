const AbstractException = require('./abstract-exception');

class RequestException extends AbstractException
{
  /**
   * Constructor
   * @param {String} message  the exception's message
   * @param {XMLHttpRequest} xhr  the XMLHttpRequest instance related to the exception
   */
  constructor(message, xhr)
  {
    super(message);
    this.xhr = xhr;
  }

  /**
   * Returns the HTTP Status code of the response
   * @returns {number}
   */
  getStatus()
  {
    return this.xhr.status;
  }

  /**
   * Returns the XMLHttpRequest instance of the request
   * @returns {XMLHttpRequest}
   */
  getXHR()
  {
    return this.xhr;
  }
}

module.exports = RequestException;
