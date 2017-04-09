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

const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.start();

casper.on('error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, url: currentURL, trace: trace } }));
});

casper.on('page.error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, url: currentURL, trace: trace } }));
});

casper.each(urls, function(casper, link) {

  currentURL = link;
  casper.thenOpen(currentURL, function() {

    var offer = casper.evaluate(function(searchCriteria) {

      var REGEXP_AGENCY_FEES = /Honoraires TTC à la charge du locataire : ((((\d{1,3})( \d{3})*)|(\d+))(\.\d+)?) €/;
      var REGEXP_IS_FURNISHED = /\bmeuble\b/i;
      var REGEXP_PRICE = /((((\d{1,3})( \d{3})*)|(\d+))(\.\d+)?) €/;
      var REGEXP_SURFACE_AREA = /([0-9]+) m2/;
      var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

      var description = document.querySelector('.synopsis-textcell').textContent.replace(/[éÉ]/g, 'e');
      var locationDetails = document.querySelector('.estateOffer-location').textContent;
      var offerDetails = document.querySelector('.estate-characteristic-right').textContent;
      var priceDetails = document.querySelector('.estateOffer-price').textContent;

      return {
        agencyFees: Number(offerDetails.match(REGEXP_AGENCY_FEES)[1].replace(' ', '')),
        isFurnished: REGEXP_IS_FURNISHED.test(description),
        price: Number(priceDetails.match(REGEXP_PRICE)[1].replace(' ', '')),
        source: "ORPI",
        surfaceArea: Number(locationDetails.match(REGEXP_SURFACE_AREA)[1]),
        type: searchCriteria.offerType,
        url: window.location.href,
        zipCode: window.location.href.match(REGEXP_ZIPCODE)[1]
      };
    }, searchCriteria);

    if (offer)
    {
      casper.echo(JSON.stringify({ type: 'offer', data: offer }));
    }
  });
});

casper.run();
