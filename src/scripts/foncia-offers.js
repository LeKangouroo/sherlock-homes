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

var offers;

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
    offers = casper.evaluate(function(selector, types) {

      const REGEXP_AGENCY_FEES = /Honoraires ([0-9]+\.?[0-9]*)/;
      const REGEXP_ZIP_CODE = /\(([0-9]{5})\)/;

      var offers = [];
      var elements = document.querySelectorAll(selector);
      var count = elements.length;

      for (var i = 0; i < count; i++)
      {
        var o = elements[i];
        var a = document.createElement('a');

        a.href = window.location.href;
        a.pathname = o.querySelector('.TeaserOffer-title a').getAttribute('href');

        var agencyFees = Number(o.querySelector('.TeaserOffer-price-mentions')
          .textContent
          .match(REGEXP_AGENCY_FEES)[1]);

        var price = Number(o.querySelector('*[data-behat="prixVenteDesBiens"]')
          .textContent
          .trim()
          .replace('€C.C*', '')
          .trim());

        var surfaceArea = Number(o.querySelector('*[data-behat="surfaceDesBiens"]')
          .textContent
          .trim()
          .replace('m2', '')
          .trim());

        // TODO: add support of multiple offer types
        var type = types.RENT;

        var zipCode = o.querySelector('.TeaserOffer-loc')
          .textContent
          .match(REGEXP_ZIP_CODE)[1];

        offers.push({
          agencyFees: agencyFees,
          price: price,
          surfaceArea: surfaceArea,
          type: type,
          url: a.href,
          zipCode: zipCode
        });
      }
      return offers;

    }, offerSelector, offerTypes);
  }
  else
  {
    offers = [];
  }
});

// Outputs offers to stdout
casper.then(function() {

  this.echo(JSON.stringify(offers));
});

casper.run();
