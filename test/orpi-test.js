const assert = require('assert');
const CasperScript = require('../src/classes/casper-script');
const OrpiSearchEngine = require('../src/classes/orpi-search-engine');
const Offer = require('../src/classes/offer');
const SearchCriteria = require('../src/classes/search-criteria');
const SearchEngineException = require('../src/classes/search-engine-exception');

describe('Orpi', function() {

  describe('Offers URLs', function() {

    it('should find at least one URL', function (done) {

      this.timeout(30000);

      let urls = [];

      const sc = new SearchCriteria({
        maxPrice: 1000,
        minSurfaceArea: 10,
        offerType: Offer.types.RENT,
        zipCodes: ['75020', '75019', '75018']
      });

      const se = new OrpiSearchEngine();

      const args = [
        `--offer-types=${JSON.stringify(Offer.types)}`,
        `--search-criteria=${JSON.stringify(sc)}`,
        `--search-engine=${JSON.stringify(se)}`
      ];

      const urlsCasperScript = new CasperScript(`${se.getName()}/get-urls`, args);

      urlsCasperScript.addObserver('data', function (message) {

        if (message.type === 'error')
        {
          throw new SearchEngineException(se, message.data.message, message.data.trace);
        }
        if (message.type === 'urls')
        {
          urls = urls.concat(message.data);
        }
      });

      urlsCasperScript.addObserver('exit', function (code) {

        if (code > 0)
        {
          throw new SearchEngineException(se, `get-urls casper script exited with code = ${code}`);
        }
        assert(urls.length > 0);
        done();
      });
    });

    it('should find no URL', function (done) {

      this.timeout(30000);

      let urls = [];

      const sc = new SearchCriteria({
        maxPrice: 300,
        minSurfaceArea: 60,
        offerType: Offer.types.RENT,
        zipCodes: ['75020', '75019', '75018']
      });

      const se = new OrpiSearchEngine();

      const args = [
        `--offer-types=${JSON.stringify(Offer.types)}`,
        `--search-criteria=${JSON.stringify(sc)}`,
        `--search-engine=${JSON.stringify(se)}`
      ];

      const urlsCasperScript = new CasperScript(`${se.getName()}/get-urls`, args);

      urlsCasperScript.addObserver('data', function (message) {

        if (message.type === 'error')
        {
          throw new SearchEngineException(se, message.data.message, message.data.trace);
        }
        if (message.type === 'urls')
        {
          urls = urls.concat(message.data);
        }
      });

      urlsCasperScript.addObserver('exit', function (code) {

        if (code > 0)
        {
          throw new SearchEngineException(se, `get-urls casper script exited with code = ${code}`);
        }
        assert(urls.length === 0);
        done();
      });
    });
  });

  describe('Offers Parsing', function() {

    it('should parse all offers', function (done) {

      this.timeout(60000);

      let urls = [];
      let offers = [];

      const sc = new SearchCriteria({
        maxPrice: 900,
        minSurfaceArea: 10,
        offerType: Offer.types.RENT,
        zipCodes: ['75020', '75019', '75018']
      });

      const se = new OrpiSearchEngine();

      const args = [
        `--offer-types=${JSON.stringify(Offer.types)}`,
        `--search-criteria=${JSON.stringify(sc)}`,
        `--search-engine=${JSON.stringify(se)}`
      ];

      const urlsCasperScript = new CasperScript(`${se.getName()}/get-urls`, args);

      urlsCasperScript.addObserver('data', function(message) {

        if (message.type === 'error')
        {
          throw new SearchEngineException(se, message.data.message, message.data.trace);
        }
        if (message.type === 'urls')
        {
          urls = urls.concat(message.data);
        }
      });

      urlsCasperScript.addObserver('exit', function(code) {

        if (code > 0)
        {
          throw new SearchEngineException(se, `get-urls casper script exited with code = ${code}`);
        }

        args.push(`--urls=${JSON.stringify(urls)}`);

        const offersCasperScript = new CasperScript(`${se.getName()}/get-offers`, args);

        offersCasperScript.addObserver('data', function (message) {

          if (message.type === 'error')
          {
            throw new SearchEngineException(se, message.data.message, message.data.trace);
          }
          if (message.type === 'offer')
          {
            offers.push(message.data);
          }
        });

        offersCasperScript.addObserver('exit', function(code) {

          if (code > 0)
          {
            throw new SearchEngineException(se, `get-offers casper script exited with code = ${code}`);
          }
          assert.strictEqual(offers.length, urls.length);
          done();
        });
      });
    });
  });
});
