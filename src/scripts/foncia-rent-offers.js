const casper = require('casper').create();

const searchCriteria = JSON.parse(casper.cli.options['search-criteria']);
const searchEngine = JSON.parse(casper.cli.options['search-engine']);

casper.echo('search criteria');
casper.echo(JSON.stringify(searchCriteria, null, 2));

casper.echo('search engine');
casper.echo(JSON.stringify(searchEngine, null, 2));

casper.start('http://casperjs.org/');

casper.then(function() {
  this.echo('First Page: ' + this.getTitle());
});

casper.thenOpen('http://phantomjs.org', function() {
  this.echo('Second Page: ' + this.getTitle());
});

casper.run();
