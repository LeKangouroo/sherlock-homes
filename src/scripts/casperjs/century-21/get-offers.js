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

const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const urls = JSON.parse(casper.cli.options['urls']);

casper.on('error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, trace: trace } }));
});

casper.on('page.error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, trace: trace } }));
});

casper.start();

casper.eachThen(urls, function(response) {

  casper.open(response.data).then(function() {

    var offer = casper.evaluate(function(searchCriteria){

      var REGEXP_AGENCY_FEES = /Honoraires locataire : ((((\d{1,3})( \d{3})*)|(\d+))(,\d+)?) €/;
      var REGEXP_IS_FURNISHED = /\bmeuble\b/i;
      var REGEXP_PRICE = /((((\d{1,3})( \d{3})*)|(\d+))(,\d+)?) €/;
      var REGEXP_SURFACE_AREA = /Surface habitable : ([0-9]+,?[0-9]*) m2/;
      var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

      var description = document.querySelector('.desc-fr').innerText.replace(/[éÉ]/g, 'e');
      var locationDetails = document.querySelector('#filAriane > *:last-child').innerText;
      var offerDetails = document.querySelector('#ficheDetail').innerText;
      var priceDetails = document.querySelector('.tarif').innerText;

      return {
        agencyFees: Number(offerDetails.match(REGEXP_AGENCY_FEES)[1].replace(',', '.').replace(' ', '')),
        isFurnished: REGEXP_IS_FURNISHED.test(description),
        price: Number(priceDetails.match(REGEXP_PRICE)[1].replace(',', '.').replace(' ', '')),
        surfaceArea: Number(offerDetails.match(REGEXP_SURFACE_AREA)[1].replace(',', '.')),
        type: searchCriteria.offerType,
        url: window.location.href,
        zipCode: locationDetails.match(REGEXP_ZIPCODE)[1]
      };
    }, searchCriteria);

    if (offer)
    {
      casper.echo(JSON.stringify({ type: 'offer', data: offer }));
    }
  });
});

casper.run();
