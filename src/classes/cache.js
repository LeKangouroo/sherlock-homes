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
    this.client.quit();
  }
  getOfferByURL(url)
  {
    return new Promise((resolve, reject) => {

      const key = `offer:${Cache.hashKeyId(url)}`;

      this.client.get(key, (err, data) => {

        if (err)
        {
          return reject(new CacheException('Error while retrieving offer by URL', err));
        }
        if (data !== null)
        {
          data = JSON.parse(data);
        }
        resolve({ key, data });
      });
    });
  }
  setOffer(offer)
  {
    return new Promise((resolve, reject) => {

      const key = `offer:${Cache.hashKeyId(offer.url)}`;

      this.client.set(key, JSON.stringify(offer), (err, res) => {

        if (err)
        {
          return reject(new CacheException('Error while set offer', err));
        }
        resolve(res);
      });
    });
  }
  static connect()
  {
    return new Promise((resolve, reject) => {

      const client = redis.createClient();

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
}

module.exports = Cache;
