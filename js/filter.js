// js/filter.js
document.addEventListener('DOMContentLoaded', () => {
  const dd       = document.getElementById('jurisdiction-filter');
  const summary  = dd.querySelector('summary');
  const jurCbs   = Array.from(dd.querySelectorAll('input[type="checkbox"]'));
  const allCb    = jurCbs.find(cb => cb.value === 'All');

  // Map of full jurisdiction names to abbreviations
  const jurisdictionMap = {
    'New South Wales': 'NSW',
    'Victoria': 'VIC',
    'Queensland': 'QLD',
    'South Australia': 'SA',
    'Western Australia': 'WA',
    'Tasmania': 'TAS',
    'Northern Territory': 'NT',
    'Australian Capital Territory': 'ACT'
  };
  
  // Make jurisdictionMap globally available
  window.jurisdictionMap = jurisdictionMap;
  
  // Reference to licence counts (defined in load-bar-data.js)
  const licenceCounts = {
    WA: 1987778,
    NT:  166271,
    VIC: 5097911,
    QLD: 4001264,
    ACT:  338043,
    TAS:  419373,
    SA:  1340060,
    NSW: 5981229
  };
  let firstOpen = true;

  // 1) On first open, select everything
  dd.addEventListener('toggle', () => {
    if (dd.open && firstOpen) {
      jurCbs.forEach(cb => cb.checked = true);
      updateUI();
      firstOpen = false;
    }
  });

  // 2) Get only the individual states that are checked
  function getSelectedIndividuals() {
    return jurCbs
      .filter(cb => cb.value !== 'All' && cb.checked)
      .map(cb => cb.value);
  }

  // 3) Update summary text & re-draw
  function updateUI() {
    const ind = getSelectedIndividuals();

    if (allCb.checked) {
      summary.textContent = 'All';
    } else if (ind.length === 1) {
      summary.textContent = ind[0];
    } else if (ind.length > 1) {
      summary.textContent = 'Multiple selections';
    } else {
      summary.textContent = 'Select a jurisdiction';
    }

    // Apply filters to all charts
    applyFilters(allCb.checked ? 'All' : ind);
  }

  // 4) Wire the "All" checkbox specially
  allCb.addEventListener('change', () => {
    if (allCb.checked) {
      // if checked, select everything
      jurCbs.forEach(cb => cb.checked = true);
    } else {
      // if unchecked, clear all individuals
      jurCbs.filter(cb => cb !== allCb)
            .forEach(cb => cb.checked = false);
    }
    updateUI();
  });

  // 5) Wire individual boxes
  jurCbs
    .filter(cb => cb !== allCb)
    .forEach(cb => {
      cb.addEventListener('change', () => {
        // uncheck "All" if any individual toggles
        if (cb.checked === false || jurCbs
              .filter(c => c !== allCb)
              .some(c => !c.checked)
        ) {
          allCb.checked = false;
        }
        updateUI();
      });
    });

  // 6) Initial UI (before any user click)
  summary.textContent = 'All';
  
  // Function to apply filters to all charts
  function applyFilters(selectedJurisdictions) {
    // Convert selected jurisdictions to their abbreviations
    let shortJurisdictions = [];
    
    if (selectedJurisdictions === 'All') {
      // If 'All' is selected, include all jurisdictions
      shortJurisdictions = Object.values(jurisdictionMap);
    } else if (selectedJurisdictions.length > 0) {
      // Map full names to abbreviations
      shortJurisdictions = selectedJurisdictions.map(j => jurisdictionMap[j] || j);
    } else {
      // If nothing is selected, don't filter
      shortJurisdictions = Object.values(jurisdictionMap);
    }
    
    // Update the global currentSelectedJurisdictions variable for the line chart
    window.currentSelectedJurisdictions = shortJurisdictions;
    
    // Apply filter to line chart
    applyLineChartFilter(shortJurisdictions);
    
    // Apply filter to card chart
    applyCardChartFilter(shortJurisdictions);
    
    // Apply filter to stacked bar chart
    applyStackedBarFilter(shortJurisdictions);
    
    // Apply filter to horizontal bar chart
    applyBarChartFilter(shortJurisdictions);
  }
  
  // Filter for line chart
  function applyLineChartFilter(shortJurisdictions) {
    // Reload the data with filter applied
    d3.csv("data/finaldata.csv", d => ({
      START_DATE: d.START_DATE.trim(),
      DETECTION_METHOD: d.DETECTION_METHOD.trim(),
      JURISDICTION: d.JURISDICTION.trim(),
      FINES: +d.FINES,
      METRIC: d.METRIC.trim()
    }))
    .then(raw => {
      // Filter by jurisdiction
      const jurisdictionFiltered = raw.filter(d => 
        shortJurisdictions.includes(d.JURISDICTION)
      );
      
      // Exclude Other & Unknown methods
      const filtered = jurisdictionFiltered.filter(d =>
        d.DETECTION_METHOD !== "Other" &&
        d.DETECTION_METHOD !== "Unknown"
      );

      const series = transformToLineChartData(filtered);
      
      // Clear and redraw
      d3.select("#line_chart").html("");
      drawLineChart(series);
    })
    .catch(err => console.error("❌ filtering line-chart data failed:", err));
  }
  
  // Filter for card chart
  function applyCardChartFilter(shortJurisdictions) {
    // Reload the data with filter applied
    d3.csv('data/finaldata.csv', d => ({
      jurisdiction: d.JURISDICTION.trim(),
      method: d.DETECTION_METHOD.trim(),
      fines: +d.FINES,
      arrests: +d.ARRESTS,
      charges: +d.CHARGES
    }))
    .then(raw => {
      // Filter by jurisdiction
      const filtered = raw.filter(d => 
        shortJurisdictions.includes(d.jurisdiction)
      );
      
      // Method buckets (copied from load-card-data.js)
      const cameraMethods = [
        'Average speed camera','Fixed camera','Fixed or mobile camera',
        'Mobile camera','Red light camera'
      ];
      const policeMethods = ['Police issued'];
      
      // Roll‐up numbers
      const totalInfringements = d3.sum(filtered, d => d.fines);
      const policeFines = d3.sum(
        filtered.filter(d => policeMethods.includes(d.method)),
        d => d.fines
      );
      const cameraFines = d3.sum(
        filtered.filter(d => cameraMethods.includes(d.method)),
        d => d.fines
      );
      const arrests = d3.sum(filtered, d => d.arrests);
      const charges = d3.sum(filtered, d => d.charges);
      
      // Package into three cards
      const cards = [
        { metrics: [
            { value: totalInfringements, label: `Speeding\ninfringements`},
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
      
      // Clear and redraw
      drawCardChart(cards);
    })
    .catch(err => console.error('❌ filtering card data failed:', err));
  }
  
  // Filter for stacked bar chart
  function applyStackedBarFilter(shortJurisdictions) {
    // Convert to lowercase for stacked bar
    const lowerJurisdictions = shortJurisdictions.map(j => j.toLowerCase());
    
    // Reload the data
    d3.csv("data/stacked-bar-data-1.csv", d => ({
      agegroup: d.AGE_GROUP,
      act: +d.ACT,
      nsw: +d.NSW,
      nt: +d.NT,
      sa: +d.SA,
      tas: +d.TAS,
      vic: +d.VIC,
      wa: +d.WA,
      qld: +d.QLD
    }))
    .then(data => {
      // For stacked bar, we need to modify the dataset
      // by zeroing out non-selected jurisdictions
      const filtered = data.map(d => {
        const newData = { agegroup: d.agegroup };
        
        // For each jurisdiction column
        Object.keys(d).forEach(key => {
          if (key !== 'agegroup') {
            // If jurisdiction is selected, keep its value, otherwise set to 0
            if (lowerJurisdictions.includes(key)) {
              newData[key] = d[key];
            } else {
              newData[key] = 0;
            }
          }
        });
        
        return newData;
      });
      
      // Clear and redraw
      d3.select("#stacked_bar").html("");
      drawStackedBars(filtered);
    })
    .catch(error => {
      console.error("Error filtering stacked bar data:", error);
    });
  }
  
  // Filter for horizontal bar chart
  function applyBarChartFilter(shortJurisdictions) {
    // Reload the data with filter applied
    d3.csv('data/finaldata.csv', d => ({
      jurisdiction: d.JURISDICTION.trim(),
      fines: +d.FINES
    }))
    .then(raw => {
      // Filter by jurisdiction
      const filtered = raw.filter(d => 
        shortJurisdictions.includes(d.jurisdiction)
      );
      
      // Roll‐up total fines by jurisdiction
      const finesByJur = Array.from(
        d3.rollup(
          filtered,
          v => d3.sum(v, d => d.fines),
          d => d.jurisdiction
        ),
        ([jur, totalFines]) => ({ jur, totalFines })
      );

      // Join licences & compute rate per 10k
      const chartData = finesByJur.map(d => ({
        jurisdiction: d.jur,
        licences: licenceCounts[d.jur],
        fines: d.totalFines,
        rate: d.totalFines / licenceCounts[d.jur] * 10000
      }));

      // Clear and redraw
      d3.select("#bar-chart").html("");
      drawFinesPer10kChart(chartData);
    })
    .catch(err => console.error('❌ filtering bar‐chart data failed:', err));
  }
  
  // Expose the filter function globally
  window.applyFilters = applyFilters;
});