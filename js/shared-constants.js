const margin = {top: 40, right: 30, bottom: 50, left: 70};
const width = 800; // total width of the chart
const height = 400; // total height of the chart
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

let innerChartS;

const tooltipWidth = 65;
const tooltipHeight = 32;

const barColor = "#F5D099";
const bodyBackgroundColor = "#fdf6d9";

// scales
const xScale = d3.scaleBand();
const yScale = d3.scaleLinear();
const xScaleS = d3.scaleLinear();
const yScaleS = d3.scaleLinear();
const colorScale = d3.scaleOrdinal();

const formatsInfo = [
    {id: "act", label: "ACT", color: "#ffc800"},
    {id: "nsw", label: "NSW", color: "#f6992d"},
    {id: "nt", label: "NT", color: "#ed6a5a"},
    {id: "sa", label: "SA", color: "#60495a"},
    {id: "tas", label: "TAS", color: "#4c7680"},
    {id: "vic", label: "VIC", color: "#7dba60"},
    {id: "wa", label: "WA", color: "#38a3a5"},
    {id: "qld", label: "QLD", color: "#c2d11b"}
]