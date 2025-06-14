// interaction.js

// Utility to slugify method names into valid CSS classes
function slugify(str) {
  return str.replace(/\s+/g, "_")
            .replace(/[^\w_]/g, "")
            .toLowerCase();
}

// Attach a Power-BI style tooltip that follows the mouse
function attachCrosshairTooltip({
  svg,       // d3.select("#your-svg")
  chart,     // d3.select("#your-chart-g") – already translated by margins
  data,      // [{ date: Date, methodA: value, … }, …]
  methods,   // ["Fixed camera","Average speed camera", …]
  xScale, yScale,
  margin,    // { top, right, bottom, left }
  width, height,
  color      // d3.scaleOrdinal for your line colors
}) {
  // Clean up any old focus/overlay/div
  chart.selectAll(".focus").remove();
  chart.selectAll(".tooltip-overlay").remove();
  d3.select("body").selectAll(".chart-tooltip").remove();

  // 1) Crosshair group
  const focus = chart.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line")
    .attr("class", "hover-line")
    .attr("stroke", "#888")
    .attr("stroke-width", 1)
    .attr("y1", 0)
    .attr("y2", height);

  methods.forEach(m => {
    focus.append("circle")
      .attr("class", "hover-dot " + slugify(m))
      .attr("r", 5)
      .style("fill", color(m))
      .style("stroke", "#fff")
      .style("stroke-width", 1);
  });

  // 2) HTML tooltip DIV
  const tooltip = d3.select("body")
    .append("div")
      .attr("class", "chart-tooltip");

  // 3) invisible overlay to catch mouse events
  chart.append("rect")
    .attr("class", "tooltip-overlay")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null);
      tooltip.style("opacity", 1);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
      tooltip.style("opacity", 0);
    })
    .on("mousemove", (event) => {
      // pointer relative to chart
      const [mx, my] = d3.pointer(event, chart.node());
      const xm = xScale.invert(mx);
      const bis = d3.bisector(d => d.date).left;
      const i  = bis(data, xm, 1);
      const d0 = data[i - 1];
      const d1 = data[i] || d0;
      const d  = (xm - d0.date) > (d1.date - xm) ? d1 : d0;

      // move the crosshair
      const cx = xScale(d.date);
      focus.select("line.hover-line")
           .attr("transform", `translate(${cx},0)`);
      methods.forEach(m => {
        focus.select("circle." + slugify(m))
             .attr("cx", cx)
             .attr("cy", yScale(d[m] || 0));
      });

      // build tooltip HTML
      let html = `<strong>${d3.timeFormat("%B")(d.date)}</strong><br/>`;
      methods.forEach(m => {
        html +=
          `<span style="color:${color(m)}">&#9679;</span> ` +
          `${m}: ${d3.format(",")(d[m] || 0)}<br/>`;
      });
      tooltip.html(html);

      // position the DIV near the cursor
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top",  (event.pageY + 10) + "px");
    });
}

// Make it globally available
window.attachCrosshairTooltip = attachCrosshairTooltip;
