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
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);
const zipCodes = JSON.parse(casper.cli.options['zip-codes']);

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

    $('#id_surface_min').val(minSurfaceArea);

  }, searchCriteria.minSurfaceArea);
});

// Selects maximum price
casper.then(function() {

  this.evaluate(function(maxPrice) {

    $('#id_budget_max').val(maxPrice);

  }, searchCriteria.maxPrice);
});

// Submits search form
casper.thenClick('#btnRECHERCHE');

// Scraps offers links
casper.then(function() {

  casper.evaluate(function() {

    var anchors = document.querySelectorAll('.annoncesListeBien:first-of-type .annonce .zone-text-loupe a');
    var length = anchors.length;

    console.log(JSON.stringify({ type: 'url', data: 'count =' + length }));

    for (var i = 0; i < length; i++)
    {
      console.log(JSON.stringify({ type: 'url', data: anchors[i].href }));
    }
  });
});

casper.then(function() {

  this.exit();
});

casper.run();
