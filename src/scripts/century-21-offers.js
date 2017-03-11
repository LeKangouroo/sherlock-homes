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

var offers;
var offersUrls;
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

casper.then(function() {

  this.capture('output.png');
});

casper.then(function() {

  console.log('end');
});

/*

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
casper.then(function() {

  const offerSelector = '.resultLayout-estateList .column';

  if (this.visible(offerSelector))
  {
    offers = [];
    offersUrls = this.evaluate(function(selector) {

      var urls = [];
      var elements = document.querySelectorAll(selector);
      var count = elements.length;

      for (var i = 0; i < count; i++)
      {
        var el = elements[i];

        urls.push(el.querySelector('.estateItem').href);
      }
      return urls;

    }, offerSelector);

    this.each(offersUrls, function(casper, link) {

      casper.thenOpen(link, function() {

        var offer = casper.evaluate(function(searchCriteria){

          var REGEXP_AGENCY_FEES = /Honoraires TTC locataire : ([0-9]+) €/;
          var REGEXP_IS_FURNISHED = /\bmeubl(é|e)\b/i;
          var REGEXP_PRICE = /([0-9]+) €/;
          var REGEXP_SURFACE_AREA = /([0-9]+) m2/;
          var REGEXP_ZIPCODE = new RegExp('((' + searchCriteria.zipCodes.join('|') + '))');

          var description = document.querySelector('.synopsis-textcell').textContent;
          var locationDetails = document.querySelector('.estateOffer-location').textContent;
          var offerDetails = document.querySelector('.estate-characteristic-right').textContent;
          var priceDetails = document.querySelector('.estateOffer-price').textContent;

          return {
            agencyFees: Number(offerDetails.match(REGEXP_AGENCY_FEES)[1]),
            isFurnished: REGEXP_IS_FURNISHED.test(description),
            price: Number(priceDetails.match(REGEXP_PRICE)[1]),
            surfaceArea: Number(locationDetails.match(REGEXP_SURFACE_AREA)[1]),
            type: searchCriteria.offerType,
            url: window.location.href,
            zipCode: window.location.href.match(REGEXP_ZIPCODE)[1]
          };
        }, searchCriteria);

        if (offer)
        {
          offers.push(offer);
        }
      });
    });
  }
  else
  {
    offers = [];
  }
});

casper.then(function() {

  this.echo(JSON.stringify(offers));
});*/

casper.run();
