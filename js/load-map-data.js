// js/load-map-data.js
// — only fetch & stash, then wrap navigateTo to call drawMap on “speeding” —

window.mapDataPromise = Promise.all([
  d3.json('data/australiaLow.json'),
  d3.json('data/finesbyjurisdiction.json')
])
.then(([geo, fines]) => {
  window.mapGeo   = geo;
  window.mapFines = fines;

  // patch navigateTo so it draws the map when you click Speeding Enforcement
  const originalNav = window.navigateTo;
  window.navigateTo = function(page) {
    originalNav(page);
    if (page === 'speeding') {
      drawMap(window.mapGeo, window.mapFines);
    }
  };
})
.catch(console.error);