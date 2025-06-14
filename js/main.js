import { drawMap } from "./map.js";

import map from "../data/australiaLow.json";
import fines from "../data/finesbyjurisdiction.json";

console.log("map", map);
console.log("fines by jurisdiction", fines);


drawMap(map, fines);