const SearchCriteria = require('../src/classes/search-criteria');
const FonciaSearchEngine = require('../src/classes/foncia-search-engine');
const Offer = require('../src/classes/offer');
const OrpiSearchEngine = require('../src/classes/orpi-search-engine');

const sc = new SearchCriteria({
  maxPrice: 800,
  minSurfaceArea: 35,
  offerType: Offer.types.RENT,
  zipCodes: ['91300', '75017']
});

const se1 = new FonciaSearchEngine();
const se2 = new OrpiSearchEngine();

const search = Promise.all([
  se1.findOffers(sc),
  se2.findOffers(sc)
]);

search.then((offers) => {

  console.log(offers);
})
.catch((error) => {

  console.error(error);
});
