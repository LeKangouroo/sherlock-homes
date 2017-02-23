const SearchCriteria = require('../src/classes/search-criteria');
// const FonciaSearchEngine = require('../src/classes/foncia-search-engine');
const offer = require('../src/classes/offer');

const sc = new SearchCriteria({
  maxPrice: 20,
  minSurfaceArea: 1,
  zipCodes: ["sdfsdfsd"]
});

/*const se = new FonciaSearchEngine({
  name: 'Foncia',
  websiteUrl: 'http://sfsdfsdfsd.com'
});*/

console.log('max price', sc.getMaxPrice());
console.log('min surface area', sc.getMinSurfaceArea());
console.log('zip codes', sc.getZipCodes());

/*console.log('se name', se.getName());
console.log('se website url', se.getWebsiteUrl());*/

// se.findOffers(sc);

const of = new offer.Offer({
  agencyFees: 0,
  price: 1,
  surfaceArea: 2,
  type: offer.types.RENT,
  url: 'https://toto.fr',
  zipCode: '54'
});

console.log('agency fees', of.getAgencyFees());
console.log('price', of.getPrice());
console.log('surface area', of.getSurfaceArea());
console.log('type', of.getType());
console.log('url', of.getUrl());
console.log('zip code', of.getZipCode());
