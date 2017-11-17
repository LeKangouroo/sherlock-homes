const casper = require('casper').create({
  onError: function onError(casper, message, trace) {

    console.log(JSON.stringify({ type: "error", data: { message: message, trace: trace } }));
  },
  verbose: true,
  logLevel: "debug",
  pageSettings: {
    loadImages: false,
    loadPlugins: false
  },
  viewportSize: {
    width: 1920,
    height: 1080
  }
});

var currentURL;

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.start();

casper.each(urls, function(casper, link) {

  currentURL = link;
  casper.thenOpen(currentURL, function() {

    var offer = casper.evaluate(function(searchCriteria, searchEngine, offerTypes) {

      /*
       * Common
       */
      var REGEXP_AGENCY_FEES;
      var REGEXP_IS_FURNISHED = /\bmeubl(é|e){1}e?s?\b/i;
      var REGEXP_PRICE = /((((\d{1,3})( \d{3})*)|(\d+))(\.\d+)?) €/;
      var REGEXP_SURFACE_AREA = /([0-9]+) m2/;
      var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

      var agencyFees;
      var description = document.querySelector('.synopsis-textcell').textContent.replace(/[éÉ]/g, 'e');
      var locationDetails = document.querySelector('.estateOffer-location').textContent;
      var offerDetails = document.querySelector('.estate-characteristic-right').textContent;
      var priceDetails = document.querySelector('.estateOffer-price').textContent;

      /*
       * Rent
       */
      if (searchCriteria.offerType === offerTypes.RENT)
      {
        REGEXP_AGENCY_FEES = /Honoraires TTC à la charge du locataire : ((((\d{1,3})( \d{3})*)|(\d+))(\.\d+)?) €/;
        agencyFees = Number(offerDetails.match(REGEXP_AGENCY_FEES)[1].replace(' ', ''));
      }

      /*
       * Purchase
       */
      if (searchCriteria.offerType === offerTypes.RENT)
      {
        agencyFees = false; // NOTE: we can't use null inside casper.evaluate because it gets replaced by an empty string
      }

      return {
        agencyFees: agencyFees,
        isFurnished: REGEXP_IS_FURNISHED.test(description),
        price: Number(priceDetails.match(REGEXP_PRICE)[1].replace(' ', '')),
        source: searchEngine.name,
        surfaceArea: Number(locationDetails.match(REGEXP_SURFACE_AREA)[1]),
        type: searchCriteria.offerType,
        url: window.location.href,
        zipCode: window.location.href.match(REGEXP_ZIPCODE)[1]
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

casper.run();
