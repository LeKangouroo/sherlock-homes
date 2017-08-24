const Century21SearchEngine = require('../../src/classes/century-21-search-engine');
const FonciaSearchEngine = require('../../src/classes/foncia-search-engine');
const LeBonCoinSearchEngine = require('../../src/classes/leboncoin-search-engine');
const OrpiSearchEngine = require('../../src/classes/orpi-search-engine');


/**
 * Returns the list of available search engines
 *
 * @returns {Array} - the list of search engines
 */
const getList = () => ([
  {
    engine: Century21SearchEngine,
    source: "century-21"
  },
  {
    engine: FonciaSearchEngine,
    source: "foncia"
  },
  {
    engine: LeBonCoinSearchEngine,
    source: "leboncoin"
  },
  {
    engine: OrpiSearchEngine,
    source: "orpi"
  }
]);


/*
 * Exports
 */
module.exports = {
  getList
};
