const casper = require('casper').create({

  onError: function(casper, msg, stackTrace) {

    casper.echo(msg);
    casper.echo(stackTrace);
  }
});

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);

// Prints CLI options to stdout
casper.echo('search criteria');
casper.echo(JSON.stringify(searchCriteria, null, 2));
casper.echo('search engine');
casper.echo(JSON.stringify(searchEngine, null, 2));
casper.echo('offer types');
casper.echo(JSON.stringify(offerTypes, null, 2));

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

casper.then(function() {

  this.waitForUrl(/location\/.+$/, function(){

    this.echo('url loaded');
  });
});

casper.then(function() {

  var url = this.evaluate(function() {

    return window.location.href;
  });

  console.log('url', url);
});

casper.then(function() {

  const offerSelector = '.TeaserOffer';

  if (this.visible(offerSelector))
  {
    console.log('offer(s) found');

    var offers = casper.evaluate(function(selector, types) {

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
        a.pathname = document.querySelector('.TeaserOffer-title a').getAttribute('href');

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
    console.log('offers count', JSON.stringify(offers, null, 2));
  }
  else
  {
    console.log('no offer found');
  }
});

casper.then(function() {

  this.echo(this.getTitle());
});
casper.run();
