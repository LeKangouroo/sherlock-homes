const casper = require('casper').create({

  // logLevel: 'debug',
  // verbose: true,
  viewportSize: {
    width: 1920,
    height: 1080
  },
  onError: function(casper, msg, backtrace) {

    console.log(msg);
    console.log(backtrace);
  },
  onLoadError: function(casper, requestUrl, status) {

    console.log('requestUrl', requestUrl, 'status', status);
  },
  onTimeout: function(timeout) {

    console.log('timed out', timeout);
  }
});

const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);

var offers;
var url = searchEngine.websiteUrl;

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

casper.then(function() {

  this.capture('output.png');
});

// casper.waitFor(
//   function() {
//
//     return this.evaluate(function() {
//
//       return document.querySelectorAll('.searchbar-item').length > 0;
//     });
//   },
//   function() {
//
//     console.log('ready');
//   },
//   function() {
//
//     console.log('timeout');
//   },
//   10000
// );

casper.then(function() {

  this.echo(this.getTitle());
});

// casper.then(function() {
//
//   var isSearchBarVisible = function() {
//
//     return document.querySelectorAll('.searchbar-item').length > 0;
//   };
//
//   this.waitFor(isSearchBarVisible, function() {
//
//     casper.then(function() {
//
//       var count = this.evaluate(function() {
//
//         return document.querySelectorAll('.searchbar-item').length;
//       });
//       console.log('count', count);
//     });
//
//     casper.then(function() {
//
//       console.log('done');
//     });
//   });
// });


// Selects search area
// casper.eachThen(searchCriteria.zipCodes, function(response) {
//
//   const zipCode = response.data;
//   const searchFieldSelector = '#searchForm_localisation_tag';
//
//   this.sendKeys(searchFieldSelector, zipCode, { keepFocus: true });
//   this.waitUntilVisible('.ui-autocomplete .ui-menu-item:first-child', function() {
//
//     this.sendKeys(searchFieldSelector, casper.page.event.key.Down);
//     this.sendKeys(searchFieldSelector, casper.page.event.key.Enter);
//   });
// });
//
// // Selects other criteria
// casper.then(function() {
//
//   // TODO: add support of property types in the SearchCriteria class (i.e. flat, house, garage, etc.)
//   const values = {
//     '#searchForm_type_bien_0': true,
//     '#searchForm_surface_min': searchCriteria.minSurfaceArea,
//     '#searchForm_prix_max': searchCriteria.maxPrice
//   };
//   this.fillSelectors('#form_search_offer', values, true);
// });
//
// // Waits for the results page to be loaded
// casper.then(function() {
//
//   this.waitForUrl(/location\/.+$/);
// });
//
// // Scraps informations
// casper.then(function() {
//
//   const offerSelector = '.TeaserOffer';
//
//   if (this.visible(offerSelector))
//   {
//     offers = casper.evaluate(function(selector, types) {
//
//       const REGEXP_AGENCY_FEES = /Honoraires ([0-9]+\.?[0-9]*)/;
//       const REGEXP_ZIP_CODE = /\(([0-9]{5})\)/;
//
//       var offers = [];
//       var elements = document.querySelectorAll(selector);
//       var count = elements.length;
//
//       for (var i = 0; i < count; i++)
//       {
//         var o = elements[i];
//         var a = document.createElement('a');
//
//         a.href = window.location.href;
//         a.pathname = document.querySelector('.TeaserOffer-title a').getAttribute('href');
//
//         var agencyFees = Number(o.querySelector('.TeaserOffer-price-mentions')
//           .textContent
//           .match(REGEXP_AGENCY_FEES)[1]);
//
//         var price = Number(o.querySelector('*[data-behat="prixVenteDesBiens"]')
//           .textContent
//           .trim()
//           .replace('€C.C*', '')
//           .trim());
//
//         var surfaceArea = Number(o.querySelector('*[data-behat="surfaceDesBiens"]')
//           .textContent
//           .trim()
//           .replace('m2', '')
//           .trim());
//
//         // TODO: add support of multiple offer types
//         var type = types.RENT;
//
//         var zipCode = o.querySelector('.TeaserOffer-loc')
//           .textContent
//           .match(REGEXP_ZIP_CODE)[1];
//
//         offers.push({
//           agencyFees: agencyFees,
//           price: price,
//           surfaceArea: surfaceArea,
//           type: type,
//           url: a.href,
//           zipCode: zipCode
//         });
//       }
//       return offers;
//
//     }, offerSelector, offerTypes);
//   }
//   else
//   {
//     offers = [];
//   }
// });
//
// // Outputs offers to stdout
// casper.then(function() {
//
//   this.echo(JSON.stringify(offers));
// });

casper.run();
