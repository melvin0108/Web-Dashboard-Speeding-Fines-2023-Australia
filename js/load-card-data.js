// load-card-data.js
let allData = [];

// 1️⃣ Load & cache everything
d3.csv('data/finaldata.csv', d => ({
  jurisdiction: d.JURISDICTION.trim(),
  method:       d.DETECTION_METHOD.trim(),
  fines:        +d.FINES,
  arrests:      +d.ARRESTS,
  charges:      +d.CHARGES
}))
.then(raw => {
  allData = raw;
  // draw initially (no filters)
  updateCards();
})
.catch(err => console.error('❌ loading card data failed:', err));


// 2️⃣ Given a filter object, compute the three cards’ metrics
function computeCardData({
  jurisdiction = 'All',
  method       = 'All'
} = {}) {
  // method buckets
  const cameraMethods = [
    'Average speed camera','Fixed camera','Fixed or mobile camera',
    'Mobile camera','Red light camera'
  ];
  const policeMethods = ['Police issued'];

  // 2a) filter the raw rows
  const data = allData.filter(d =>
    (jurisdiction === 'All' || d.jurisdiction === jurisdiction) &&
    (method       === 'All'
      || (method === 'Police' && policeMethods.includes(d.method))
      || (method === 'Camera' && cameraMethods.includes(d.method))
    )
  );

  // 2b) roll‐up numbers
  const totalInfringements = d3.sum(data, d => d.fines);
  const policeFines       = d3.sum(
    data.filter(d => policeMethods.includes(d.method)),
    d => d.fines
  );
  const cameraFines       = d3.sum(
    data.filter(d => cameraMethods.includes(d.method)),
    d => d.fines
  );
  const arrests           = d3.sum(data, d => d.arrests);
  const charges           = d3.sum(data, d => d.charges);

  // 2c) package into three cards
  return [
    { metrics: [
        { value: totalInfringements, label: `Speeding\ninfringements`}
      ]
    },
    { metrics: [
        { value: policeFines, label: 'Police fines' },
        { value: cameraFines, label: 'Camera fines' }
      ]
    },
    { metrics: [
        { value: arrests, label: 'Arrests' },
        { value: charges, label: 'Charges' }
      ]
    }
  ];
}


// 3️⃣ Call this (with an optional filter object) to re-draw your cards
function updateCards(filters = {}) {
  const cards = computeCardData(filters);
  drawCardChart(cards);
}

// expose for your future onchange
window.updateCards = updateCards;