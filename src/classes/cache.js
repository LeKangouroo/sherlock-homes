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
    return new Promise((resolve, reject) => {

      const hash = crypto
        .createHash('md5')
        .update(url)
        .digest('hex');

      console.log('hash', hash);
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
}

module.exports = Cache;
