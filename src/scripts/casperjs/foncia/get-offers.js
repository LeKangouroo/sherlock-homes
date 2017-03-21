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

casper.on('remote.message', function(msg) { console.log(msg); });

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.start();

casper.each(urls, function(casper, link) {

  casper.thenOpen(link, function() {

    casper.evaluate(function(types) {

      var REGEXP_AGENCY_FEES = /Honoraires ([0-9]+\.?[0-9]*)/;
      var REGEXP_IS_FURNISHED = /\bmeuble\b/i;
      var REGEXP_PRICE = /([0-9]+\.[0-9]*)/;
      var REGEXP_SURFACE_AREA = /([0-9.]+) m2/;
      var REGEXP_ZIP_CODE = /\(([0-9]{5})\)/;

      var agencyFees = Number(document.querySelector('.OfferTop-mentions')
        .textContent
        .match(REGEXP_AGENCY_FEES)[1]);

      var isFurnished = REGEXP_IS_FURNISHED.test(document.querySelector('.OfferDetails-content').textContent.replace(/[éÉ]/g, 'e'));

      var price = Number(document.querySelector('.OfferTop-price')
        .textContent
        .trim()
        .match(REGEXP_PRICE)[1]);

      var surfaceArea = Number(document.querySelector('.OfferTop-col--right')
        .textContent
        .trim()
        .match(REGEXP_SURFACE_AREA)[1]);

      // TODO: add support of multiple offer types
      var type = types.RENT;

      var zipCode = document.querySelector('.OfferTop-loc')
        .textContent
        .match(REGEXP_ZIP_CODE)[1];

      var offer = {
        agencyFees: agencyFees,
        isFurnished: isFurnished,
        price: price,
        surfaceArea: surfaceArea,
        type: type,
        url: window.location.href,
        zipCode: zipCode
      };

      console.log(JSON.stringify({ type: 'offer', data: offer }));

    }, offerTypes);
  });
});

casper.run();
