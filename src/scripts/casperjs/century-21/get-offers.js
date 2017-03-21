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

const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.start();

casper.each(urls, function(casper, link) {

  casper.thenOpen(link, function() {

    casper.evaluate(function(searchCriteria){

      var REGEXP_AGENCY_FEES = /Honoraires locataire : ([0-9]+) €/;
      var REGEXP_IS_FURNISHED = /\bmeuble\b/i;
      var REGEXP_PRICE = /([0-9]+) €/;
      var REGEXP_SURFACE_AREA = /Surface habitable : ([0-9]+) m2/;
      var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

      var description = document.querySelector('.desc-fr').textContent.replace(/[éÉ]/g, 'e');
      var locationDetails = document.querySelector('#filAriane > *:last-child').textContent;
      var offerDetails = document.querySelector('#ficheDetail').textContent;
      var priceDetails = document.querySelector('.tarif').textContent;

      var offer = {
        agencyFees: Number(offerDetails.match(REGEXP_AGENCY_FEES)[1]),
        isFurnished: REGEXP_IS_FURNISHED.test(description),
        price: Number(priceDetails.match(REGEXP_PRICE)[1]),
        surfaceArea: Number(offerDetails.match(REGEXP_SURFACE_AREA)[1]),
        type: searchCriteria.offerType,
        url: window.location.href,
        zipCode: locationDetails.match(REGEXP_ZIPCODE)[1]
      };

      if (offer)
      {

      }

      console.log(JSON.stringify({ type: 'offer', data: 'foobar' }));
      console.log(JSON.stringify({ type: 'offer', data: offer }));

    }, searchCriteria);
  });
});

casper.run();
