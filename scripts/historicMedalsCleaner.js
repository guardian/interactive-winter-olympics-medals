import fs from "fs"
import * as d3 from "d3"

const data = JSON.parse(fs.readFileSync("./src/assets/data/historicMedals.json", "utf-8"));

const nested_data = d3.nest()
	.key(d => d.Year)
	.key(d => d.NOC)
	.key(d => d.Sport)
	.key(d => d.Event)
	.key(d => d.EventGender)
	.key(d => d.Medal)
	.rollup(l => l.length)
	.entries(data);


fs.writeFileSync("./src/assets/data/historic.json", JSON.stringify(nested_data));