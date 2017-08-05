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

casper.on('error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, trace: trace } }));
});

casper.on('page.error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, trace: trace } }));
});

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

// Scraps informations
casper.waitForSelector('.TeaserOffer',
  function() {

    casper.then(function() {

      getOfferLinks('.TeaserOffer .TeaserOffer-title a', '.Pagination a:last-child');
    });
  },
  function onTimeout() {

    casper.log('No offer found in Foncia website', 'info');
  }
);

casper.run();
