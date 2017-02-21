const SearchCriteria = require('../src/classes/search-criteria');

const sc = new SearchCriteria({
  maxPrice: 20,
  minSurfaceArea: 1,
  zipCodes: ["sdfsdfsd"]
});

console.log('max price', sc.getMaxPrice());
console.log('min surface area', sc.getMinSurfaceArea());
console.log('zip codes', sc.getZipCodes());
