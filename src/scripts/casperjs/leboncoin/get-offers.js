const casper = require('casper').create({
  pageSettings: {
    loadImages: false,
    loadPlugins: false
  },
  viewportSize: {
    width: 1920,
    height: 1080
  },
  retryTimeout: 500,
  waitTimeout: 10000,
  logLevel: 'debug',
  verbose: true
});

var currentURL;

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.start();

casper.on('error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, url: currentURL, trace: trace } }));
});

casper.on('page.error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, url: currentURL, trace: trace } }));
});

casper.eachThen(urls, function(response) {

  currentURL = response.data;
  casper.open(currentURL).then(function() {

    casper.waitForSelector('#footer', function() {

      var offer = casper.evaluate(function(searchCriteria, searchEngine, offerTypes) {

        /*
         * Common
         */

        var REGEXP_IS_NOT_FURNISHED;
        var REGEXP_SURFACE_AREA = /([0-9]+\.?[0-9]*) m2/;
        var REGEXP_ZIP_CODE = /([0-9]{5})/;

        var agencyFees = false; // NOTE: we can't use null inside casper.evaluate because it gets replaced by an empty string
        var isFurnishedXPath;
        var isFurnishedElement;
        var isFurnished;
        var price = Number(document.querySelector('.properties *[itemprop="price"]').getAttribute('content'));
        var surfaceAreaXPath = '//*[contains(concat(" ", normalize-space(@class), " "), " properties ")]/*[contains(concat(" ", normalize-space(@class), " "), " line ")]//*[contains(concat(" ", normalize-space(@class), " "), " property ") and text()="Surface"]/following-sibling::span';
        var surfaceArea = Number(document.evaluate(surfaceAreaXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.match(REGEXP_SURFACE_AREA)[1]);
        var zipCode = document.querySelector('.properties *[itemprop="address"]').textContent.trim().match(REGEXP_ZIP_CODE)[1];

        /*
         * Rent
         */

        if (searchCriteria.offerType === offerTypes.RENT)
        {
          REGEXP_IS_NOT_FURNISHED = /non meuble/i;
          isFurnishedXPath = '//*[contains(concat(" ", normalize-space(@class), " "), " properties ")]/*[contains(concat(" ", normalize-space(@class), " "), " line ")]//*[contains(concat(" ", normalize-space(@class), " "), " property ") and text()="Meublé / Non meublé"]/following-sibling::span';
          isFurnishedElement = document.evaluate(isFurnishedXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          isFurnished = !REGEXP_IS_NOT_FURNISHED.test(isFurnishedElement.innerText.replace(/[éÉ]/g, 'e'));
        }

        /*
         * Purchase
         */

        if (searchCriteria.offerType === offerTypes.PURCHASE)
        {
          isFurnished = false;
        }

        return {
          agencyFees: agencyFees,
          isFurnished: isFurnished,
          price: price,
          source: searchEngine.name,
          surfaceArea: surfaceArea,
          type: searchCriteria.offerType,
          url: window.location.href,
          zipCode: zipCode
        };
      }, searchCriteria, searchEngine, offerTypes);

      if (offer)
      {
        if (offer.agencyFees === false)
        {
          offer.agencyFees = null;
        }
        casper.echo(JSON.stringify({ type: 'offer', data: offer }));
      }
    });
  });
});

casper.run();
