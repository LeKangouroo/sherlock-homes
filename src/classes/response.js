const ResponseException = require('./response-exception');

class Response
{
  /**
   * Constructor
   * @param {XMLHTTPRequest} xhr - an instance of XMLHTTPRequest class
   */
  constructor(xhr)
  {
    const httpCode = xhr.status;

    this.headers = Response.parseXHRHeaders(xhr);
    this.ok = (httpCode >= 200 && httpCode <= 299);
    this.status = httpCode;
    this.statusText = xhr.statusText;
    this.xhr = xhr;
    this.url = xhr.responseURL;
  }

  /**
   * Returns response headers
   * @returns {Object} the response's headers
   */
  getHeaders()
  {
    return this.headers;
  }

  /**
   * Returns response status code
   * @returns {Number} the status code
   */
  getStatus()
  {
    return this.status;
  }

  /**
   * Returns response status message
   * @returns {String} the status message
   */
  getStatusText()
  {
    return this.statusText;
  }

  /**
   * Returns response URL
   * @returns {String} the url
   */
  getURL()
  {
    return this.url;
  }

  /**
   * Checks if the response was successful
   * @returns {Boolean}
   */
  isOK()
  {
    return this.ok;
  }

  /**
   * Parses the response body as JSON and returns it
   * @returns {Object}
   * @throws ResponseException
   */
  json()
  {
    try
    {
      return JSON.parse(this.xhr.responseText);
    }
    catch (e)
    {
      throw new ResponseException('error while parsing response body as JSON');
    }
  }

  /**
   * Returns the response body as plain text
   * @returns {String}
   */
  text()
  {
    return this.xhr.responseText;
  }

  /**
   * Returns an object of key / value pairs headers
   * @param {XMLHTTPRequest} xhr - an instance of the XMLHTTPRequest class
   * @returns {Object}
   */
  static parseXHRHeaders(xhr)
  {
    return xhr
      .getAllResponseHeaders()
      .trim()
      .split('\r\n')
      .map((header) => header.split(':'))
      .map((header) => {

        const name = header[0].trim().toLowerCase();
        const value = header[1].trim();

        return { name, value };
      })
      .reduce((headers, header) => {

        headers[header.name] = header.value;

        return headers;

      }, {});
  }
}

module.exports = Response;
