const RequestException = require('./request-exception');
const Response = require('./response');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

/**
 * Abstraction layer for asynchronous requests using XMLHttpRequest
 */
class Request
{
  /**
   * Constructor
   * @param {String} url - the URL of the requested resource
   * @param {String} [method='GET'] - the HTTP method to use
   * @param {?Blob|?FormData|?String} body - the body of the request
   * @param {Object} [headers={}] - the headers of the request
   */
  constructor(url, method = "GET", body = null, headers = {})
  {
    this.body = body;
    this.headers = headers;
    this.method = method;
    this.url = url;
    this.xhr = new XMLHttpRequest();
  }

  ///////////////////////////////////////////////////////////////
  // INSTANCE METHODS
  ///////////////////////////////////////////////////////////////

  /**
   * Sends the request and returns a promise
   * @returns {Promise} Passes the XMLHttpRequest instance to the resolve function or a RequestException to the reject function
   */
  send()
  {
    return new Promise((resolve, reject) => {

      this.xhr.open(this.method, this.url, true);
      for (let prop in this.headers)
      {
        if (this.headers.hasOwnProperty(prop))
        {
          this.xhr.setRequestHeader(prop, this.headers[prop]);
        }
      }
      this.xhr.onreadystatechange = () => {

        // NOTE: if the request is complete (see: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState)
        if (this.xhr.readyState === 4)
        {
          /*
           * NOTE: this can happen for example if the client is not connected to the Internet
           * or if an HTTPS URL with an unauthorized self-signed TLS/SSL certificate has been requested
           */
          if (this.xhr.status === 0)
          {
            reject(new RequestException('Unexpected XMLHTTPRequest error', this.xhr));
          }
          else
          {
            resolve(new Response(this.xhr));
          }
        }
      };
      if (this.body !== null)
      {
        this.xhr.send(this.body);
      }
      else
      {
        this.xhr.send();
      }
    });
  }

  /**
   * Sets the body of the request
   * @param {Blob|FormData|String} body - the body of the request
   * @returns {Request} returns the current instance of the Request class
   */
  setBody(body)
  {
    this.body = body;
    return this;
  }

  /**
   * Sets the headers of the request
   * @param {Object} headers - the headers of the request
   * @returns {Request} returns the current instance of the Request class
   */
  setHeaders(headers)
  {
    if (headers instanceof Object)
    {
      for (let prop in headers)
      {
        if (headers.hasOwnProperty(prop))
        {
          this.headers[prop] = headers[prop];
        }
      }
    }
    return this;
  }

  /**
   * Sets the HTTP method of the request
   * @param {String} method - the HTTP method to use
   * @returns {Request} returns the current instance of the Request class
   */
  setMethod(method)
  {
    this.method = method;
    return this;
  }

  /**
   * Sets the URL of the requested resource
   * @param {String} url - the URL of the resource
   * @returns {Request} returns the current instance of the Request class
   */
  setURL(url)
  {
    this.url = url;
    return this;
  }
}

module.exports = Request;
