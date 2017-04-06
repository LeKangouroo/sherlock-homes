const argv = require('../usage/usage').argv;
const Century21SearchEngine = require('../../src/classes/century-21-search-engine');
const FonciaSearchEngine = require('../../src/classes/foncia-search-engine');
const Offer = require('../../src/classes/offer');
const OrpiSearchEngine = require('../../src/classes/orpi-search-engine');
const SearchCriteria = require('../../src/classes/search-criteria');
const Websocket = require('ws');

const server = new Websocket.Server({
  host:               argv.host,
  port:               argv.port,
  perMessageDeflate:  false,
});

server.on('listening', () => {

  console.log('listening on port ' + argv.port);
});

server.on('connection', (client) => {

  client.on('message', (message) => {

    console.log('message', message);

    try
    {
      message = JSON.parse(message);

      if (typeof message.type !== 'string')
      {
        return client.send(JSON.stringify({ type: 'error', data: 'invalid message type' }));
      }
      if (typeof message.data === 'undefined')
      {
        return client.send(JSON.stringify({ type: 'error', data: 'invalid message data' }));
      }
      if (message.type === 'find-offers')
      {
        const sc = new SearchCriteria(message.data);
        const searchEngines = [
          new Century21SearchEngine(),
          new FonciaSearchEngine(),
          new OrpiSearchEngine()
        ];

        searchEngines.forEach((se) => {

          se.addObserver('urls-found', (urls) => {

            client.send(JSON.stringify({ type: 'find-offers:new-results-count', data: urls.length }));
          });
          se.addObserver('offer-found', (offer) => {

            client.send(JSON.stringify({ type: 'find-offers:offer-found', data: offer }));
          });
        });

        const promises = searchEngines.map((se) => se.findOffers(sc));

        Promise.all(promises).then((offers) => {

          offers = [].concat.apply([], offers);

          client.send(JSON.stringify({ type: 'find-offers:complete', data: offers }));
        })
        .catch((err) => {

          client.send(JSON.stringify({ type: 'error', data: err }));
        });
      }
    }
    catch (err)
    {
      client.send(JSON.stringify({ type: 'error', data: err }));
    }
  });
});
