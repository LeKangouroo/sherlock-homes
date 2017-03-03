const SearchCriteria = require('../src/classes/search-criteria');
const FonciaSearchEngine = require('../src/classes/foncia-search-engine');
const Offer = require('../src/classes/offer');

const sc = new SearchCriteria({
  maxPrice: 800,
  minSurfaceArea: 10,
  offerType: Offer.types.RENT,
  zipCodes: ['91300', '75017']
});

const se = new FonciaSearchEngine();

console.log('max price', sc.getMaxPrice());
console.log('min surface area', sc.getMinSurfaceArea());
console.log('zip codes', sc.getZipCodes());

console.log('se name', se.getName());
console.log('se website url', se.getWebsiteUrl());

se.findOffers(sc)
  .then((offers) => {

    console.log(offers);
  })
  .catch((error) => {

    console.error(error);
  });
