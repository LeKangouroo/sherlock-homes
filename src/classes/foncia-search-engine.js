const page = require('webpage').create();
const SearchEngine = require('./search-engine');

// TODO: create a wrapper class for phantomjs (see https://www.npmjs.com/package/phantomjs)

class FonciaSearchEngine extends SearchEngine
{
  constructor(options)
  {
    super(options);
  }
  findOffers(searchCriteria)
  {
    super.findOffers(searchCriteria);

    page.open(this.getWebsiteUrl(), (status) => {

      console.log('page opened with status', status);
    });
  }
}

module.exports = FonciaSearchEngine;
