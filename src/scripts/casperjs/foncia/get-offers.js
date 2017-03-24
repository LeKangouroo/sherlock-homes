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

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.start();
casper.eachThen(urls, function(response) {
  casper.open(response.data).then(function() {
    casper.waitForSelector('.Footer', function() {

      var offer = casper.evaluate(function(types) {

        var REGEXP_AGENCY_FEES = /Honoraires ([0-9]+\.?[0-9]*)/;
        var REGEXP_IS_FURNISHED = /\bmeuble\b/i;
        var REGEXP_PRICE = /([0-9]+\.[0-9]*)/;
        var REGEXP_SURFACE_AREA = /([0-9]+\.?[0-9]*) m2/;
        var REGEXP_ZIP_CODE = /\(([0-9]{5})\)/;

        var agencyFees = Number(document.querySelector('.OfferTop-mentions').innerText.match(REGEXP_AGENCY_FEES)[1]);
        var isFurnished = REGEXP_IS_FURNISHED.test(document.querySelector('.OfferDetails-content').innerText.replace(/[éÉ]/g, 'e'));
        var price = Number(document.querySelector('.OfferTop-price').innerText.match(REGEXP_PRICE)[1]);
        var surfaceArea = Number(document.querySelector('.OfferTop-col--right').innerText.match(REGEXP_SURFACE_AREA)[1]);
        var type = types.RENT; // TODO: add support of multiple offer types
        var zipCode = document.querySelector('.OfferTop-loc').innerText.match(REGEXP_ZIP_CODE)[1];

        return {
          agencyFees: agencyFees,
          isFurnished: isFurnished,
          price: price,
          surfaceArea: surfaceArea,
          type: type,
          url: window.location.href,
          zipCode: zipCode
        };
      }, offerTypes);

      if (offer)
      {
        casper.echo(JSON.stringify({ type: 'offer', data: offer }));
      }
    });
  });
});
casper.run();
