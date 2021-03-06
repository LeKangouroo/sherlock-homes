const CacheException = require('./cache-exception');
const crypto = require('crypto');
const redis = require('redis');

class Cache
{
  constructor(client)
  {
    this.client = client;
  }
  disconnect()
  {
    if (this.client)
    {
      this.client.quit();
    }
  }
  getData(key)
  {
    return new Promise((resolve, reject) => {

      this.client.get(key, (err, data) => {

        if (err)
        {
          return reject(new CacheException(`Error while retrieving value of key "${key}" in the cache server`, err));
        }
        if (data !== null)
        {
          data = JSON.parse(data);
        }
        resolve({ key, data });
      });
    });
  }
  findOfferByURL(url)
  {
    return this.getData(`offer:${Cache.hashKeyId(url)}`);
  }
  saveOffer(offer)
  {
    const key = `offer:${Cache.hashKeyId(offer.url)}`;
    const data = JSON.stringify(offer);

    return this.setData(key, data);
  }
  setData(key, data)
  {
    return new Promise((resolve, reject) => {

      this.client.set(key, data, (err) => {

        if (err)
        {
          return reject(new CacheException(`Error while setting value of key "${key}"`, err));
        }
        resolve();
      });
    });
  }
  static connect()
  {
    return new Promise((resolve, reject) => {

      const client = redis.createClient(this.config.port, this.config.host);

      client.on('ready', () => resolve(client));
      client.on('error', (err) => reject(new CacheException('Failed to connect to the cache server', err)));
    });
  }
  static getInstance()
  {
    return new Promise((resolve, reject) => {

      if (this.instance)
      {
        return resolve(this.instance);
      }
      Cache
        .connect()
        .then((client) => {

          this.instance = new Cache(client);
          resolve(this.instance);
        })
        .catch((err) => reject(err));
    });
  }
  static hashKeyId(id)
  {
    return crypto
      .createHash('md5')
      .update(id)
      .digest('hex');
  }
  static isConnected()
  {
    return (typeof this.instance !== 'undefined');
  }
  static setHost(host)
  {
    this.config.host = host;
  }
  static setPort(port)
  {
    this.config.port = port;
  }
}

Cache.config = { host: '127.0.0.1', port: 6379 };
Cache.instance = null;

module.exports = Cache;
