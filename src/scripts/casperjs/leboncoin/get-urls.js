/*
 * Constants
 */

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
const moment = require('moment');
const offersAgeInDays = 3;
const offerTypes = JSON.parse(casper.cli.options['offer-types']);
const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);
const isForPurchase = searchCriteria.offerType === offerTypes.PURCHASE;
const searchFieldSelector = '#search_box input[name="location_p"]';

/*
 * Functions
 */

function getMaxPriceSelectorClosestValue(maxPriceSelector, maxPrice)
{
  return getSelectOptions(maxPriceSelector)
    .map(function(option) { return option.value })
    .filter(isStringNotEmpty)
    .map(parseBase10Integer)
    .filter(function(price) { return price <= maxPrice })
    .pop();
}

function getMinSurfaceAreaSelectorClosestValue(minSurfaceAreaSelector, minSurfaceArea)
{
  return getSelectOptions(minSurfaceAreaSelector)
    .filter(function(option) {

      return isStringNotEmpty(option.value)
    })
    .map(function(option) {

      return {
        surface: parseBase10Integer(option.label),
        value: option.value
      };
    })
    .filter(function(option) {

      return option.surface <= minSurfaceArea
    })
    .pop()
    .value;
}

function getSelectOptions(selectSelector)
{
  return casper.evaluate(function(selectSelector) {

    var select = document.querySelector(selectSelector);
    var length = select.options.length;
    var options = [];
    var option;

    for (var i = 0; i < length; i++)
    {
      option = select.options[i];
      options.push({
        label: option.textContent,
        value: option.value
      });
    }

    return options;

  }, selectSelector);
}

function getOffersMetadata(linksSelector, nextButtonSelector, days)
{
  const today = moment();
  const offersMetas = casper.evaluate(function(linksSelector) {

    var anchors = document.querySelectorAll(linksSelector);
    var length = anchors.length;
    var metas = [];
    var publicationDate;
    var link;

    for (var i = 0; i < length; i++)
    {
      link = anchors[i];
      publicationDate = link.querySelector('*[itemprop="availabilityStarts"]').getAttribute('content');
      metas.push({
        publicationDate: publicationDate,
        url: link.href
      });
    }

    return metas;

  }, linksSelector);
  const recentOffersMetas = offersMetas.filter(function(metas) {

    return (today.diff(moment(metas.publicationDate, 'YYYY-MM-DD'), 'days') <= days);
  });
  const urls = recentOffersMetas.map(function(metas) {

    return metas.url;
  });

  casper.echo(JSON.stringify({ type: 'urls', data: urls }));

  if (offersMetas.length === recentOffersMetas.length && casper.visible(nextButtonSelector))
  {
    casper.thenClick(nextButtonSelector);
    casper.waitUntilVisible(linksSelector);
    casper.then(function() {

      getOffersMetadata(linksSelector, nextButtonSelector, days);
    });
  }
}

function isStringNotEmpty(str)
{
  return str.length > 0;
}

function parseBase10Integer(str)
{
  return parseInt(str, 10);
}


/*
 * Processing
 */

casper.on('error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, trace: trace } }));
});

casper.on('page.error', function(message, trace) {

  console.log(JSON.stringify({ type: 'error', data: { message: message, trace: trace } }));
});

// Loads search engine's website url
casper.start(searchEngine.websiteUrl);

// Goes to the section of the website corresponding to the offer type
if (isForPurchase)
{
  casper.thenClick('#footer a[title="Ventes immobilières"]');
}
else
{
  casper.thenClick('#footer a[title="Locations"]');
}

casper.waitUntilVisible(searchFieldSelector, function() {

  // Selects search area
  casper.eachThen(searchCriteria.zipCodes, function(response) {

    const zipCode = response.data;

    this.sendKeys(searchFieldSelector, zipCode, { keepFocus: true });
    this.waitUntilVisible('.location-list.visible', function() {

      this.sendKeys(searchFieldSelector, casper.page.event.key.Down);
      this.sendKeys(searchFieldSelector, casper.page.event.key.Enter);
    });
  });
});

// Selects other criteria
casper.then(function() {

  const maxPriceSelector = (isForPurchase) ? '#pe' : '#mre';
  const maxPriceSelectorValue = getMaxPriceSelectorClosestValue(maxPriceSelector, searchCriteria.maxPrice);

  const minSurfaceAreaSelector = '#sqs';
  const minSurfaceAreaSelectorValue = getMinSurfaceAreaSelectorClosestValue(minSurfaceAreaSelector, searchCriteria.minSurfaceArea);

  const values = {
    '#ret_2': true // TODO: add support of property types in the SearchCriteria class (i.e. flat, house, garage, etc.)
  };

  values[maxPriceSelector] = String(maxPriceSelectorValue);
  values[minSurfaceAreaSelector] = String(minSurfaceAreaSelectorValue);

  casper.fillSelectors('#search_box', values, true);
});

// Scraps informations
casper.then(function() {

  casper.waitForSelector('.tabsContent .list_item',
    function() {

      casper.then(function() {

        getOffersMetadata('.tabsContent .list_item', '.pagination_links #next', offersAgeInDays);
      });
    },
    function onTimeout() {

      casper.log('No offer found in Leboncoin website', 'info');
    }
  );
});

casper.run();
