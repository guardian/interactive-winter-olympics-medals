import fs from "fs"
import * as d3 from "d3"

const data = JSON.parse(fs.readFileSync("./src/assets/data/historicMedals.json", "utf-8"));

const nested_data = d3.nest()
    .key(d => d.Year)
    .key(d => d.NOC)
    .rollup(leaves => {
        return {
            "total": leaves.length,
            "golds": leaves.filter(d => d.Medal === "Gold").length
        }
    })
    .entries(data);


fs.writeFileSync("./src/assets/data/historicMedalsClean.json", JSON.stringify(nested_data));