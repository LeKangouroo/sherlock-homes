const SearchCriteria = require('../src/classes/search-criteria');
const FonciaSearchEngine = require('../src/classes/foncia-search-engine');

const sc = new SearchCriteria({
  maxPrice: 20,
  minSurfaceArea: 1,
  zipCodes: ["sdfsdfsd"]
});

const se = new FonciaSearchEngine({
  name: 'Foncia',
  websiteUrl: 'http://sfsdfsdfsd.com'
});

console.log('max price', sc.getMaxPrice());
console.log('min surface area', sc.getMinSurfaceArea());
console.log('zip codes', sc.getZipCodes());

console.log('se name', se.getName());
console.log('se website url', se.getWebsiteUrl());
