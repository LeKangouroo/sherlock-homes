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
casper.then(function() {

  this.sendKeys('#searchForm_localisation_tag', searchCriteria.zipCodes[1], { keepFocus: true });
});
casper.waitUntilVisible('.ui-autocomplete .ui-menu-item:first-child', function() {

  var value = casper.evaluate(function() {

    // TODO: trigger arrow up and enter key to simulate user interaction

    return document.querySelector('.ui-autocomplete .ui-menu-item:first-child').textContent;
    // return document.querySelector('#searchForm_localisation').value;
  });

  console.log('value', value);
});
casper.then(function() {

  this.echo(this.getTitle());
});
casper.run();
