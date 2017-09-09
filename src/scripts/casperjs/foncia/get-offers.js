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
  waitTimeout: 10000
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

    casper.waitForSelector('.Footer', function() {

      var offer = casper.evaluate(function(searchCriteria, searchEngine, offerTypes) {

        /*
         * Common
         */

        var REGEXP_AGENCY_FEES;
        var REGEXP_IS_FURNISHED = /\bmeubl(é|e){1}e?s?\b/i;
        var REGEXP_PRICE = /((((\d{1,3})( \d{3})*)|(\d+))(\.\d+)?)/;
        var REGEXP_SURFACE_AREA = /([0-9]+\.?[0-9]*) m2/;
        var REGEXP_ZIP_CODE = /\(([0-9]{5})\)/;

        var agencyFeesMatches;
        var agencyFeesIndex;
        var agencyFees;
        var isFurnished = REGEXP_IS_FURNISHED.test(document.querySelector('.OfferDetails-content').innerText.replace(/[éÉ]/g, 'e'));
        var price = Number(document.querySelector('.OfferTop-price').textContent.match(REGEXP_PRICE)[1].replace(' ', ''));
        var surfaceArea = Number(document.querySelector('.OfferTop-col--right').innerText.match(REGEXP_SURFACE_AREA)[1]);
        var zipCode = document.querySelector('.OfferTop-loc').innerText.match(REGEXP_ZIP_CODE)[1];

        /*
         * Rent
         */
        if (searchCriteria.offerType === offerTypes.RENT)
        {
          REGEXP_AGENCY_FEES = /Honoraires charge locataire (\([^)]+\) )?((((\d{1,3})( \d{3})*)|(\d+))(\.\d+)?)/;
          agencyFeesMatches = document.querySelector('.OfferDetails-content').textContent.match(REGEXP_AGENCY_FEES);
          agencyFeesIndex = (agencyFeesMatches[1].charAt(0) === '(') ? 2 : 1;
          agencyFees = Number(agencyFeesMatches[agencyFeesIndex].replace(' ', ''));
        }

        /*
         * Purchase
         */
        if (searchCriteria.offerType === offerTypes.PURCHASE)
        {
          agencyFees = false; // NOTE: we can't use null inside casper.evaluate because it gets replaced by an empty string
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
