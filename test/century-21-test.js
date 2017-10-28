const assert = require('assert');
const CasperScript = require('../src/classes/casper-script');
const Century21SearchEngine = require('../src/classes/century-21-search-engine');
const Offer = require('../src/classes/offer');
const SearchCriteria = require('../src/classes/search-criteria');
const SearchEngineException = require('../src/classes/search-engine-exception');

describe('Century21', function() {

  describe('Zip codes autocomplete items', function() {

    it('should find a result', function(done) {

      Century21SearchEngine.findZipCodeAutocomplete('75017').then((data) => {

        assert.strictEqual(data.cp, '75017');
        done();
      })
      .catch((error) => {

        done(error);
      })
    });

    it('should find no result', function(done) {

      Century21SearchEngine.findZipCodeAutocomplete('sdfsdfsdf').then((data) => {

        assert.strictEqual(data, null);
        done();
      })
      .catch((error) => {

        done(error);
      })
    });
  });

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

      Promise.all([
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[0]),
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[1]),
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[2])
      ])
      .then(function(zipCodes) {

        const se = new Century21SearchEngine();

        const args = [
          `--offer-types=${JSON.stringify(Offer.types)}`,
          `--search-criteria=${JSON.stringify(sc)}`,
          `--search-engine=${JSON.stringify(se)}`,
          `--zip-codes=${JSON.stringify(zipCodes)}`
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
      })
      .catch(function(error) {

        done(error);
      });
    });

    it('should find no URL', function (done) {

      this.timeout(30000);

      let urls = [];

      const sc = new SearchCriteria({
        maxPrice: 400,
        minSurfaceArea: 60,
        offerType: Offer.types.RENT,
        zipCodes: ['75020', '75019', '75018']
      });

      Promise.all([
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[0]),
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[1]),
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[2])
      ])
      .then(function(zipCodes) {

        const se = new Century21SearchEngine();

        const args = [
          `--offer-types=${JSON.stringify(Offer.types)}`,
          `--search-criteria=${JSON.stringify(sc)}`,
          `--search-engine=${JSON.stringify(se)}`,
          `--zip-codes=${JSON.stringify(zipCodes)}`
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
      })
      .catch(function(error) {

        done(error);
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

      Promise.all([
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[0]),
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[1]),
        Century21SearchEngine.findZipCodeAutocomplete(sc.getZipCodes()[2])
      ])
      .then(function(zipCodes) {

        const se = new Century21SearchEngine();

        const args = [
          `--offer-types=${JSON.stringify(Offer.types)}`,
          `--search-criteria=${JSON.stringify(sc)}`,
          `--search-engine=${JSON.stringify(se)}`,
          `--zip-codes=${JSON.stringify(zipCodes)}`
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
      })
      .catch(function(error) {

        done(error);
      });
    });
  });
});
