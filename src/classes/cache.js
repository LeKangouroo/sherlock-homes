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
  static connect(options = { host: '127.0.0.1', port: 6379 })
  {
    const { host, port } = options;
    const client = redis.createClient(port, host);

    client.on('ready', () => {
      this.instance = new Cache(client);
    });
    client.on('error', (err) => {
      throw new CacheException('Failed to connect to the cache server', err);
    });
  }
  static getInstance()
  {
    return new Promise((resolve, reject) => {

      if (this.instance)
      {
        resolve(this.instance);
      }
      reject(new CacheException('No cache client instance available yet. You need to use the connect method first.'));
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
}

Cache.instance = null;

module.exports = Cache;
