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

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);
const zipCodes = JSON.parse(casper.cli.options['zip-codes']);

var offers = [];
var offersLinks = [];
var url = searchEngine.websiteUrl;

// Goes to the section of the website corresponding to the offer type
url += (searchCriteria.offerType === offerTypes.PURCHASE) ? '/acheter' : '/louer';
casper.start(url);

// Waits for the search form to load
casper.waitForSelector('#blocRECHERCHE');

// Selects property types
// TODO: add support of property types in the SearchCriteria class (i.e. flat, house, garage, etc.)
casper.thenClick('#btn-id_types_biens_1');

// Selects zip codes
casper.waitUntilVisible('.token-input-list-facebook', function() {

  casper.eachThen(zipCodes, function(response) {

    this.evaluate(function(zipCode) { $('#id_localisation').tokenInput('add', zipCode) }, response.data);
  });
});

// Selects minimum surface area
casper.then(function() {

  this.evaluate(function(minSurfaceArea) {

    $('#slider-id_surface_min').slider({ value: minSurfaceArea })

  }, searchCriteria.minSurfaceArea);
});

// Selects maximum price
casper.then(function() {

  this.evaluate(function(maxPrice) {

    $('#slider-id_budget_max').slider({ value: maxPrice })

  }, searchCriteria.maxPrice);
});

// Submits search form
casper.thenClick('#btnRECHERCHE');

// Scraps offers links
casper.then(function() {

  offersLinks = casper.evaluate(function() {

    var anchors = document.querySelectorAll('.annonce .zone-text-loupe a');
    var length = anchors.length;
    var urls = [];

    for (var i = 0; i < length; i++)
    {
      urls.push(anchors[i].href);
    }
    return urls;
  });
});

// Scraps offers data
casper.then(function() {

  casper.each(offersLinks, function(casper, link) {

    casper.thenOpen(link, function() {

      var offer = casper.evaluate(function(searchCriteria){

        var REGEXP_AGENCY_FEES = /Honoraires locataire : ([0-9]+) €/;
        var REGEXP_IS_FURNISHED = /\bmeuble\b/i;
        var REGEXP_PRICE = /([0-9]+) €/;
        var REGEXP_SURFACE_AREA = /Surface habitable : ([0-9]+) m2/;
        var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

        var description = document.querySelector('.desc-fr').textContent.replace(/[éÉ]/g, 'e');
        var locationDetails = document.querySelector('#filAriane > *:last-child').textContent;
        var offerDetails = document.querySelector('#ficheDetail').textContent;
        var priceDetails = document.querySelector('.tarif').textContent;

        return {
          agencyFees: Number(offerDetails.match(REGEXP_AGENCY_FEES)[1]),
          isFurnished: REGEXP_IS_FURNISHED.test(description),
          price: Number(priceDetails.match(REGEXP_PRICE)[1]),
          surfaceArea: Number(offerDetails.match(REGEXP_SURFACE_AREA)[1]),
          type: searchCriteria.offerType,
          url: window.location.href,
          zipCode: locationDetails.match(REGEXP_ZIPCODE)[1]
        };
      }, searchCriteria);

      if (offer)
      {
        offers.push(offer);
      }
    });
  });
});

casper.then(function() {

  this.echo(JSON.stringify(offers));
});

casper.run();
