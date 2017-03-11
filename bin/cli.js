const Century21SearchEngine = require('../src/classes/century-21-search-engine');
const SearchCriteria = require('../src/classes/search-criteria');
const FonciaSearchEngine = require('../src/classes/foncia-search-engine');
const Offer = require('../src/classes/offer');
const OrpiSearchEngine = require('../src/classes/orpi-search-engine');

const sc = new SearchCriteria({
  maxPrice: 780,
  minSurfaceArea: 20,
  offerType: Offer.types.RENT,
  zipCodes: [
    '91300',
    '75017'
  ]
});

const se1 = new FonciaSearchEngine();
const se2 = new OrpiSearchEngine();
const se3 = new Century21SearchEngine();

const search = Promise.all([
  se3.findOffers(sc)
  // se1.findOffers(sc),
  // se2.findOffers(sc)
]);

search.then((offers) => {

  offers = [].concat.apply([], offers);

  console.log(JSON.stringify(offers));
})
.catch((error) => {

  console.error(error);
});
