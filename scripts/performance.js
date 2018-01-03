import fs from "fs"
import * as d3 from "d3"
import mergeByKey from "array-merge-by-key"

const prevMedals = JSON.parse(fs.readFileSync("./src/assets/data/medalsList2014.json", "utf-8"));
const currMedals = JSON.parse(fs.readFileSync("./src/assets/data/medalsList.json", "utf-8"));

const prevMedalsThatHaveBeenAwardedSoFar = prevMedals.filter(p => {
	const matches = currMedals.filter(c => c.olympicEvent.olympicEventId === p.olympicEvent.olympicEventId && c.medalWon === p.medalWon);
	return matches.length > 0;
});

const currMedalsByCountry = d3.nest()
	.key(d => d.abbreviation)
	.rollup(leaves => leaves.length)
	.entries(currMedals)
	.map(d => {
		d.currMedalsCount = d.value
		delete d.value
		return d;
	})

const prevMedalsByCountry = d3.nest()
	.key(d => d.abbreviation)
	.rollup(leaves => leaves.length)
	.entries(prevMedalsThatHaveBeenAwardedSoFar)
	.map(d => {
		d.prevMedalsCount = d.value
		delete d.value
		return d;
	})

const allMedalsByCountry = mergeByKey("key", currMedalsByCountry, prevMedalsByCountry)
	.map(d => {
		d.diff = d.currMedalsCount - d.prevMedalsCount;
		return d;
	});

fs.writeFileSync("./src/assets/data/performance.json", JSON.stringify(allMedalsByCountry));

