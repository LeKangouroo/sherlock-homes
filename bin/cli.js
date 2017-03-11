const Century21SearchEngine = require('../src/classes/century-21-search-engine');
const SearchCriteria = require('../src/classes/search-criteria');
const FonciaSearchEngine = require('../src/classes/foncia-search-engine');
const Offer = require('../src/classes/offer');
const OrpiSearchEngine = require('../src/classes/orpi-search-engine');

const sc = new SearchCriteria({
  maxPrice: 800,
  minSurfaceArea: 10,
  offerType: Offer.types.RENT,
  zipCodes: [
    '75001',
    '75002',
    '75003',
    '75004',
    '75005',
    '75006',
    '75007',
    '75008',
    '75009',
    '75010',
    '75011',
    '75012',
    '75013',
    '75014',
    '75015',
    '75016',
    '75017',
    '75018',
    '75019',
    '75020'
  ]
});

const se1 = new FonciaSearchEngine();
const se2 = new OrpiSearchEngine();
const se3 = new Century21SearchEngine();

const search = Promise.all([
  se1.findOffers(sc),
  se2.findOffers(sc),
  se3.findOffers(sc)
]);

search.then((offers) => {

  offers = [].concat.apply([], offers);

  console.log(JSON.stringify(offers));
  process.exit(0);
})
.catch((error) => {

  console.error(error);
  process.exit(1);
});
