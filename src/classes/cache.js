const CacheException = require('./cache-exception');
const crypto = require('crypto');
const redis = require('redis');

class Cache
{
  constructor()
  {
    this.client = redis.createClient();
  }
  getOfferByURL(url)
  {
    return new Promise((resolve) => {

      const key = `offer:${Cache.hashKeyId(url)}`;

      this.client.get(key, (err, data) => {

        if (err)
        {
          throw new CacheException('Error while retrieving offer by URL', err);
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
    return new Promise((resolve) => {

      const key = `offer:${Cache.hashKeyId(offer.url)}`;

      this.client.set(key, JSON.stringify(offer), (err, res) => {

        if (err)
        {
          throw new CacheException('Error while set offer', err);
        }
        resolve(res);
      });
    });
  }
  static getInstance()
  {
    if (!this.instance)
    {
      this.instance = new Cache();
    }
    return this.instance;
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
