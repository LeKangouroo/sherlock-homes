const argv = require('../usage/usage').argv;
const Century21SearchEngine = require('../../src/classes/century-21-search-engine');
const FonciaSearchEngine = require('../../src/classes/foncia-search-engine');
const Hapi = require('hapi');
const Offer = require('../../src/classes/offer');
const OrpiSearchEngine = require('../../src/classes/orpi-search-engine');
const SearchCriteria = require('../../src/classes/search-criteria');

const server = new Hapi.Server();

server.connection({
  host: argv.host,
  port: argv.port
});

server.start((err) => {

  if (err)
  {
    throw err;
  }
  console.log(`[Sherlock] Server running at: ${server.info.uri}`);
});

server.route({

  method: 'GET',
  path: '/',
  handler: (request, reply) => {

    reply('Welcome to Sherlock Homes API');
  }
});

server.route({

  method: 'POST',
  path: '/',
  handler: (request, reply) => {

    try
    {
      const criteria = request.payload;

      if (criteria.offerType)
      {
        criteria.offerType = criteria.offerType === 'purchase' ? Offer.types.PURCHASE : Offer.types.RENT;
      }

      const sc = new SearchCriteria(criteria);
      const se1 = new FonciaSearchEngine();
      const se2 = new OrpiSearchEngine();
      const se3 = new Century21SearchEngine();

      const search = Promise.all([
        se1.findOffers(sc),
        se2.findOffers(sc),
        se3.findOffers(sc)
      ]);

      search.then((offers) => {

        offers = [].concat.apply([], offers);

        reply(offers);
      })
      .catch((error) => {

        const response = reply({
          message: error.getMessage(),
          name: error.getName()
        });

        response.statusCode = 500;
      });
    }
    catch (error)
    {
      const response = reply({
        message: error.getMessage(),
        name: error.getName()
      });

      response.statusCode = 400;
    }
  }
});
