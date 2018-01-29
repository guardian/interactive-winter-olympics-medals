import templateHTML from "./src/templates/main.html!text"
import headerHTML from "./src/templates/header.html!text"
import medalTableJson from "../src/assets/data/medalsTable.json"
import medalListByDisciplineJson from "../src/assets/data/medalsList.json"
import countryPerformanceJson from "../src/assets/data/performance.json"
import rp from "request-promise"
import Mustache from "mustache"
import * as d3 from "d3"
import fs from "fs"

const maxDiff = d3.max(countryPerformanceJson, d => Math.abs(d.diff));

const scale = d3.scaleLinear().domain([0, maxDiff]).range([0, 50]);

const countries = [
    ["Great Britain", "GBR"],
    ["Russia", "RUS"],
    ["Norway", "NOR"],
    ["Germany", "GER"]
];

const countryPerformanceJsonToRender = countryPerformanceJson.map((country) => {
    // console.log(country)
    country.name = country.name;
    country.percentage = scale(Math.abs(country.diff));
    country.class = country.diff >= 0 ? "positive" : "negative";
    country.displayDiff = (country.diff > 0) ? "+" + country.diff : country.diff;
    country.margin = country.diff >= 0 ? 50 : 50 - country.percentage;
    return country;
});
console.log(countryPerformanceJsonToRender)
const sortedByPerformance = countryPerformanceJsonToRender.sort((a, b) => b.diff - a.diff);
const topOverPerforming = sortedByPerformance.slice(0, 3);
const topUnderPerforming = sortedByPerformance.slice(- 3);

// const medalListByDisciplineJsonWithShowHide = medalListByDisciplineJson.map(medal => {
//     const day = medal.startDate.find(d => d.dateType === "Local").date;
//     return Object.assign({}, medal, { todayClass: (day === ) })
// });

const mappedDisciplines = medalListByDisciplineJson.map(discip => Object.assign({}, discip, { lowerCaseAbbreviation: discip.abbreviation.toLowerCase()}))

const nestedMedalsByDiscipline = d3.nest()
    .key(d => d.discipline.name)
    .key(d => d.olympicEvent.name)
    .rollup(leaves => {
        return {
            "gold": leaves.filter(d => d.medalWon === "gold"),
            "silver": leaves.filter(d => d.medalWon === "silver"),
            "bronze": leaves.filter(d => d.medalWon === "bronze")
        }
    })
    .entries(mappedDisciplines
        .sort((a, b) => {
            if (a.medalWon === "gold") {
                return -1;
            } else if (a.medalWon === "silver" && b.medalWon === "bronze") {
                return -1;
            } else {
                return 1;
            }
        })
    )

// fs.writeFileSync("./src/assets/data/test.json", JSON.stringify(nestedMedalsByDiscipline))

const medalTable = medalTableJson.map((country, i) => {
    let goldMedals = [];
    let silverMedals = [];
    let bronzeMedals = [];

    const preferableName = country.olympicCountry.name.length > 21 ? country.olympicCountry.abbreviation : country.olympicCountry.name;

    ["gold", "silver", "bronze"].forEach(type => {
        new Array(country.medalCount[type]).fill(null).forEach(medal => {
            type === 'gold' && goldMedals.push(type);
            type === 'silver' && silverMedals.push(type);
            type === 'bronze' && bronzeMedals.push(type);
        });
    });
    
    return Object.assign({}, country, {
        goldMedals: {
            list: goldMedals,
            total: goldMedals.length
        },
        silverMedals: {
            list: silverMedals,
            total: silverMedals.length
        },
        bronzeMedals: {
            list: bronzeMedals,
            total: bronzeMedals.length
        },
        rank: i + 1,
        preferableName: preferableName,
        lowerCaseAbbreviation: country.olympicCountry.abbreviation.toLowerCase()
    });
});

export async function render() {
    const header = headerHTML;
    return "<div class='page-wrapper'>" + header + Mustache.render(templateHTML, {
        "countryCodes": countries,
        "otherCountries": medalTable.slice(6),
        "topCountries": medalTable.slice(0, 6),
        "medalsByDiscipline": nestedMedalsByDiscipline,
        "topOverPerforming": topOverPerforming,
        "topUnderPerforming": topUnderPerforming
    }) + "</div>";
}