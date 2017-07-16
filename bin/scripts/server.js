const argv = require('../usage/usage').argv;
const Cache = require('../../src/classes/cache');
const Century21SearchEngine = require('../../src/classes/century-21-search-engine');
const FonciaSearchEngine = require('../../src/classes/foncia-search-engine');
const Logger = require('../../src/classes/logger');
const OrpiSearchEngine = require('../../src/classes/orpi-search-engine');
const SearchCriteria = require('../../src/classes/search-criteria');
const ServerException = require('../../src/classes/server-exception');
const Websocket = require('ws');

function findOffers(client, message)
{
  const sc = new SearchCriteria(message.data);
  const searchEngines = [
    new Century21SearchEngine(),
    new FonciaSearchEngine(),
    new OrpiSearchEngine()
  ];

  searchEngines.forEach((se) => {

    se.addObserver('error', (error) => {

      logger.error(error.getMessage(), error);
      sendMessage(client, JSON.stringify({ type: 'find-offers:error', data: error }));
    });
    se.addObserver('urls-found', (urls) => {

      sendMessage(client, JSON.stringify({ type: 'find-offers:new-results-count', data: urls.length }));
    });
    se.addObserver('offer-found', (offer) => {

      sendMessage(client, JSON.stringify({ type: 'find-offers:offer-found', data: offer }));
    });
  });

  const promises = searchEngines.map((se) => se.findOffers(sc, { interruptOnError: false }));

  Promise.all(promises).then((offers) => {

    offers = [].concat.apply([], offers);

    sendMessage(client, JSON.stringify({ type: 'find-offers:complete', data: offers }));
  })
  .catch((error) => {

    logger.error(error.getMessage(), error);
    sendMessage(client, JSON.stringify({ type: 'failure', data: error }));
  });
}

function parseMessage(message)
{
  return new Promise((resolve, reject) => {

    try
    {
      message = JSON.parse(message);

      if (typeof message.type !== 'string')
      {
        return reject(new ServerException('invalid message type'));
      }
      if (typeof message.data === 'undefined')
      {
        return reject(new ServerException('invalid message data'));
      }
      resolve(message);
    }
    catch (error)
    {
      reject(new ServerException('error during incoming message parsing', error));
    }
  });
}

function sendMessage(client, message)
{
  client.send(message);
  logger.debug('message sent', message);
}

function init({ logger, server })
{
  server.on('listening', () => {

    logger.info('listening on port ' + argv.port);
  });
  server.on('connection', (client) => {

    client.on('message', (message) => {

      logger.debug('message received', message);

      parseMessage(message).then((message) => {

        if (message.type === 'find-offers')
        {
          findOffers(client, message);
        }
        else
        {
          throw new ServerException(`invalid message type : ${message.type}`);
        }
      })
      .catch((error) => {

        logger.error(error.getMessage(), error);
        sendMessage(client, JSON.stringify({ type: 'failure', data: error }));
      });
    });
  });
}

const logger = Logger.getInstance({
  email: {
    enabled: argv.logEmail,
    from: argv.logEmailFrom,
    to: argv.logEmailTo,
    server: {
      host: argv.logEmailHost,
      pass: argv.logEmailPass,
      port: argv.logEmailPort,
      user: argv.logEmailUser
    }
  }
});

const server = new Websocket.Server({
  host:               argv.host,
  port:               argv.port,
  perMessageDeflate:  false,
});

Cache.setHost(argv.cacheServerHost);
Cache.setPort(argv.cacheServerPort);
init({ logger, server });
