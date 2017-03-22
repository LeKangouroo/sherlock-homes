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

var urls = [];

// Loads search engine's website url
casper.start(searchEngine.websiteUrl);

// Goes to the section of the website corresponding to the offer type
if (searchCriteria.offerType === offerTypes.PURCHASE)
{
  casper.thenClick('.Btn--achat');
}
else
{
  casper.thenClick('.Btn--location');
}

// Selects search area
casper.eachThen(searchCriteria.zipCodes, function(response) {

  const zipCode = response.data;
  const searchFieldSelector = '#searchForm_localisation_tag';

  this.sendKeys(searchFieldSelector, zipCode, { keepFocus: true });
  this.waitUntilVisible('.ui-autocomplete .ui-menu-item:first-child', function() {

    this.sendKeys(searchFieldSelector, casper.page.event.key.Down);
    this.sendKeys(searchFieldSelector, casper.page.event.key.Enter);
  });
});

// Selects other criteria
casper.then(function() {

  // TODO: add support of property types in the SearchCriteria class (i.e. flat, house, garage, etc.)
  const values = {
    '#searchForm_type_bien_0': true,
    '#searchForm_surface_min': searchCriteria.minSurfaceArea,
    '#searchForm_prix_max': searchCriteria.maxPrice
  };
  this.fillSelectors('#form_search_offer', values, true);
});

// Waits for the results page to be loaded
casper.then(function() {

  this.waitForUrl(/location\/.+$/);
});

// Scraps informations
casper.then(function() {

  const offerSelector = '.TeaserOffer';

  if (this.visible(offerSelector))
  {
    urls = this.evaluate(function(offerSelector) {

      var offers = document.querySelectorAll(offerSelector);
      var length = offers.length;
      var urls = [];

      for (var i = 0; i < length; i++)
      {
        var o = offers[i];
        var a = document.createElement('a');
        var el = o.querySelector('.TeaserOffer-title a');

        if (el && el.href)
        {
          urls.push(el.href);
        }
      }
      return urls;
    }, offerSelector);
  }
});

casper.then(function() {

  this.echo(JSON.stringify({ type: 'urls', data: urls }));
});

casper.run();
