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
  },
  retryTimeout: 500,
  waitTimeout: 10000
});

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);
const zipCodes = JSON.parse(casper.cli.options['zip-codes']);

var url = searchEngine.websiteUrl;

function getOfferLinks(linksSelector, nextButtonSelector)
{
  var urls = casper.evaluate(function(linksSelector) {

    var anchors = document.querySelectorAll(linksSelector);
    var length = anchors.length;
    var urls = [];

    for (var i = 0; i < length; i++)
    {
      urls.push(anchors[i].href);
    }
    return urls;

  }, linksSelector);

  casper.echo(JSON.stringify({ type: 'urls', data: urls }));

  if (casper.visible(nextButtonSelector))
  {
    casper.thenClick(nextButtonSelector);
    casper.waitUntilVisible(linksSelector);
    casper.then(function() {

      getOfferLinks(linksSelector, nextButtonSelector);
    });
  }
}

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
casper.waitForSelector('.annoncesListeBien:first-of-type .annonce', function() {

  casper.then(function() {

    getOfferLinks('.annoncesListeBien:first-of-type .annonce .zone-text-loupe a', '.btnSUIV_PREC.suivant a');
  });
});

casper.run();
