const casper = require('casper').create({
  onError: function(casper, msg, stackTrace) {

    console.log('error:', msg);
    console.trace(stackTrace);
  }
});

const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);

casper.echo('search criteria');
casper.echo(JSON.stringify(searchCriteria, null, 2));
casper.echo('search engine');
casper.echo(JSON.stringify(searchEngine, null, 2));
casper.start(searchEngine.websiteUrl);
casper.thenClick('.Btn--location');
casper.eachThen(searchCriteria.zipCodes, function(response) {

  const zipCode = response.data;
  const searchFieldSelector = '#searchForm_localisation_tag';

  this.sendKeys(searchFieldSelector, zipCode, { keepFocus: true });
  this.waitUntilVisible('.ui-autocomplete .ui-menu-item:first-child', function() {

    this.sendKeys(searchFieldSelector, casper.page.event.key.Down);
    this.sendKeys(searchFieldSelector, casper.page.event.key.Enter);
  });
});
casper.then(function() {

  var value = casper.evaluate(function() {

    return document.querySelector('#searchForm_localisation').value;
  });

  console.log('value5', value);
});
casper.then(function() {

  this.echo(this.getTitle());
});
casper.run();
