const casper = require('casper').create({
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

casper.on('error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, url: currentURL, trace: trace } }));
});

casper.on('page.error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, url: currentURL, trace: trace } }));
});

casper.start();

casper.eachThen(urls, function(response) {

  currentURL = response.data;
  casper.open(currentURL).then(function() {

    var offer = casper.evaluate(function(searchCriteria, searchEngine, offerTypes){

      var REGEXP_AGENCY_FEES;
      var REGEXP_IS_FURNISHED = /\bmeubl(é|e){1}e?s?\b/i;
      var REGEXP_PRICE = /((((\d{1,3})( \d{3})*)|(\d+))(,\d+)?) €/;
      var REGEXP_SURFACE_AREA = /Surface habitable : ([0-9]+,?[0-9]*) m2/;
      var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

      var agencyFees;
      var description = document.querySelector('.desc-fr').innerText.replace(/[éÉ]/g, 'e');
      var locationDetails = document.querySelector('#filAriane > *:last-child').innerText;
      var offerDetails = document.querySelector('#ficheDetail').innerText;
      var priceDetails = document.querySelector('.tarif').innerText;

      /*
       * Rent
       */

      if (searchCriteria.offerType === offerTypes.RENT)
      {
        REGEXP_AGENCY_FEES = /Honoraires charge locataire : ((((\d{1,3})( \d{3})*)|(\d+))(,\d+)?) €/;
        agencyFees = Number(offerDetails.match(REGEXP_AGENCY_FEES)[1].replace(',', '.').replace(' ', ''));
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
        isFurnished: REGEXP_IS_FURNISHED.test(description),
        price: Number(priceDetails.match(REGEXP_PRICE)[1].replace(',', '.').replace(' ', '')),
        source: searchEngine.name,
        surfaceArea: Number(offerDetails.match(REGEXP_SURFACE_AREA)[1].replace(',', '.')),
        type: searchCriteria.offerType,
        url: window.location.href,
        zipCode: locationDetails.match(REGEXP_ZIPCODE)[1]
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
