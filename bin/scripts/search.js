const argv = require('../usage/usage').argv;
const Cache = require('../../src/classes/cache');
const Century21SearchEngine = require('../../src/classes/century-21-search-engine');
const FonciaSearchEngine = require('../../src/classes/foncia-search-engine');
const json2csv = require('json2csv');
const Logger = require('../../src/classes/logger');
const Offer = require('../../src/classes/offer');
const OrpiSearchEngine = require('../../src/classes/orpi-search-engine');
const SearchCriteria = require('../../src/classes/search-criteria');

function cacheServerDisconnect()
{
  if (Cache.isConnected())
  {
    Cache.getInstance().then((instance) => instance.disconnect());
  }
}

function fail(error)
{
  Logger.getInstance().error(error.toString(), error);
  process.exit(1);
}

try
{
  Cache.setHost(argv.cacheServerHost);
  Cache.setPort(argv.cacheServerPort);

  const sc = new SearchCriteria({
    maxPrice: argv.maxPrice,
    minSurfaceArea: argv.minSurface,
    offerType: argv.offerType === 'purchase' ? Offer.types.PURCHASE : Offer.types.RENT,
    zipCodes: argv.zipCodes.map(String)
  });
  const se1 = new FonciaSearchEngine();
  const se2 = new OrpiSearchEngine();
  const se3 = new Century21SearchEngine();
  const search = Promise.all([
    se1.findOffers(sc),
    se2.findOffers(sc),
    se3.findOffers(sc)
  ]);

  search
    .then((offers) => {

      offers = [].concat.apply([], offers);
      if (offers.length > 0)
      {
        let data;
        switch (argv.format)
        {
          case 'csv':
            data = json2csv({ data: offers, fields: Object.keys(offers[0]), del: argv.delimiter });
            break;
          default:
            data = JSON.stringify(offers, null, 2);
            break;
        }
        process.stdout.write(data, 'utf8');
      }
      else
      {
        process.stdout.write('Aucune offre trouvée');
      }
      cacheServerDisconnect();
      process.exit(0);
    })
    .catch((error) => {

      cacheServerDisconnect();
      fail(error);
    });
}
catch (error)
{
  cacheServerDisconnect();
  fail(error);
}
