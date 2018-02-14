import fs from "fs"
import * as d3 from "d3"
import mergeByKey from "array-merge-by-key"

const prevMedals = JSON.parse(fs.readFileSync("./src/lookups/medalsList2014.json", "utf-8"));
const currMedals = JSON.parse(fs.readFileSync("./src/assets/data/medalsList.json", "utf-8"));

const prevMedalsThatHaveBeenAwardedSoFar = prevMedals.filter(p => {
	const matches = currMedals.filter(c => c.olympicEvent.olympicEventId === p.olympicEvent.olympicEventId && c.medalWon === p.medalWon);
	return matches.length > 0;
});

Set.prototype.difference = function(setB) {
    var difference = new Set(this);
    for (var elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

const lookup = {}
currMedals.forEach(obj => lookup[obj.olympicEvent.olympicEventId] = obj.olympicEvent)

const x = new Set(prevMedals.map( obj => obj.olympicEvent.olympicEventId ))
const y = new Set(currMedals.map( obj => obj.olympicEvent.olympicEventId ))

console.log(Array.from(y.difference(x)).map(code => lookup[code]))

const currMedalsByCountry = d3.nest()
	.key(d => d.displayName)
	// .rollup(leaves => leaves.length)
	.entries(currMedals)
	.map(d => {
		d.currMedalsCount = d.values.length
		d.abbreviation = d.values.length > 0 && d.values[0].abbreviation
		// delete d.value
		delete d.values
		return d;
	})

const prevMedalsByCountry = d3.nest()
	.key(d => d.displayName)
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
//fs.writeFileSync("./src/assets/data/performance.json", JSON.stringify(allMedalsByCountry));
//feilding edited, but should look at more
fs.writeFileSync("./src/assets/data/performance.json", JSON.stringify(currMedalsByCountry));
