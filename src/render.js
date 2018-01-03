import templateHTML from "./src/templates/main.html!text"
import medalTableJson from "../src/assets/data/medalsTable.json"
import medalListByDisciplineJson from "../src/assets/data/medalsListByDiscipline.json"
import countryPerformanceJson from "../src/assets/data/performance.json"
import rp from "request-promise"
import Mustache from "mustache"
import * as d3 from "d3"

const maxDiff = d3.max(countryPerformanceJson, d => Math.abs(d.diff));

const scale = d3.scaleLinear().domain([0, maxDiff]).range([0, 50]);

const countryPerformanceJsonToRender = countryPerformanceJson.map((country) => {
	country.percentage = scale(Math.abs(country.diff));
	country.class = country.diff >= 0 ? "positive" : "negative";
	country.displayDiff = (country.diff > 0) ? "+" + country.diff : country.diff;
	country.margin = country.diff >= 0 ? 50 : 50 - country.percentage;
	return country;
});

export async function render() {
    return Mustache.render(templateHTML, {
        "countries": medalTableJson,
        "medalsByDiscipline": medalListByDisciplineJson,
        "performance": countryPerformanceJsonToRender.sort((a, b) => b.diff - a.diff)
    });
}