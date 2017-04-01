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

  if (nextButtonSelector && casper.visible(nextButtonSelector))
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

// Goes to the section of the website corresponding to the offer type
url += (searchCriteria.offerType === offerTypes.PURCHASE) ? '/acheter' : '/louer';
casper.start(url);

// Waits for the search form to load
casper.waitForSelector('.searchbar-item');

// Selects property types
casper
  .thenClick('.searchbar-item:nth-child(2) .dropdown-button')
  .thenClick('.searchbar-item:nth-child(2) .selectable-box-appartement .selectable-box-inner');

// Selects zip codes
casper
  .thenClick('.searchbar-item:nth-child(3) .dropdown-button')
  .eachThen(searchCriteria.zipCodes, function(response) {

    var zipCode = response.data;
    var searchFieldSelector = '.searchbar-item:nth-child(3) .Select-input input';
    var searchResultsSelector = '.searchbar-item:nth-child(3) .Select-menu-outer .Select-option.is-focused';

    this.sendKeys(searchFieldSelector, zipCode, { keepFocus: true });
    this.waitForSelector(searchResultsSelector, function() {

      this.sendKeys(searchFieldSelector, casper.page.event.key.Enter);
    });
  });

// Selects min surface area
casper
  .thenClick('.searchbar-item:nth-child(4) .dropdown-button')
  .then(function() {

    var surfaceAreaFieldSelector = '.searchbar-item:nth-child(4) input[name="minSurface"]';

    this.sendKeys(surfaceAreaFieldSelector, searchCriteria.minSurfaceArea.toString(10), {keepFocus: true});
    this.sendKeys(surfaceAreaFieldSelector, casper.page.event.key.Enter);
    this.wait(1000);
  });

// Selects max price
casper
  .thenClick('.searchbar-item:nth-child(5) .dropdown-button')
  .then(function() {

    var maxPriceFieldSelector = '.searchbar-item:nth-child(5) input[name="maxPrice"]';

    this.sendKeys(maxPriceFieldSelector, searchCriteria.maxPrice.toString(10));
    this.wait(1000);
  });

// Submit search form
casper.thenClick('.searchbar-item .button-search-searchbar');

// Waits for the results page to be loaded
casper.then(function() {

  this.waitForUrl(/recherche\/.+$/);
});

// Scraps offers informations
casper.waitForSelector('.resultLayout-estateList',
  function() {

    casper.then(function() {

      getOfferLinks('.resultLayout-estateList .column .estateItem', null);
    });
  },
  function onTimeout() {

    casper.log('No offer found in Orpi website');
  }
);

casper.run();
