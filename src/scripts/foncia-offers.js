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

var offers = [];

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
    var urls = this.evaluate(function(offerSelector) {

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

    this.each(urls, function(casper, url) {

      casper.thenOpen(url, function() {

        var offer = casper.evaluate(function(types) {

          var REGEXP_AGENCY_FEES = /Honoraires ([0-9]+\.?[0-9]*)/;
          var REGEXP_IS_FURNISHED = /\bmeubl(é|e)\b/i;
          var REGEXP_PRICE = /([0-9]+\.[0-9]*)/;
          var REGEXP_SURFACE_AREA = /([0-9.]+) m2/;
          var REGEXP_ZIP_CODE = /\(([0-9]{5})\)/;

          var agencyFees = Number(document.querySelector('.OfferTop-mentions')
            .textContent
            .match(REGEXP_AGENCY_FEES)[1]);

          var isFurnished = REGEXP_IS_FURNISHED.test(document.querySelector('.OfferDetails-content').textContent);

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

          return {
            agencyFees: agencyFees,
            isFurnished: isFurnished,
            price: price,
            surfaceArea: surfaceArea,
            type: type,
            url: window.location.href,
            zipCode: zipCode
          };

        }, offerTypes);

        if (offer)
        {
          offers.push(offer);
        }
      });
    });
  }
});

// Outputs offers to stdout
casper.then(function() {

  this.echo(JSON.stringify(offers));
});

casper.run();
