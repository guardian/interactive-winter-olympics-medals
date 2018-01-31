import templateHTML from "./src/templates/main.html!text"
import headerHTML from "./src/templates/header.html!text"
import medalTableJson from "../src/assets/data/medalsTable.json"
import medalListByDisciplineJson from "../src/assets/data/medalsList.json"
import countryPerformanceJson from "../src/assets/data/performance.json"
import rp from "request-promise"
import Mustache from "mustache"
import * as d3 from "d3"
import fs from "fs"
import _filter from 'lodash/filter'

const maxDiff = d3.max(countryPerformanceJson, d => Math.abs(d.diff));

const scale = d3.scaleLinear().domain([0, maxDiff]).range([0, 50]);

const countries = [
    ["Great Britain", "GBR"],
    ["Russia", "RUS"],
    ["Norway", "NOR"],
    ["Germany", "GER"]
];

const countryPerformanceJsonToRender = countryPerformanceJson.map((country) => {
    // country.percentage = scale(Math.abs(country.diff));
    // country.margin = country.diff >= 0 ? 50 : 50 - country.percentage;
    // country.name = country.key;
    country.abbreviation = country.abbreviation.toLowerCase();
    // country.class = country.diff >= 0 ? "positive" : "negative";
    // country.diff = country.diff
    return country;
});

const relevantCountries = countryPerformanceJsonToRender.filter(country => country.diff !== 0)

const sortedByPerformance = relevantCountries.sort((a, b) => b.diff - a.diff);
// const topOverPerforming = sortedByPerformance.slice(0, 3);
// const topUnderPerforming = sortedByPerformance.slice(- 3);

const pluraliseMedals = medalCount => medalCount > 1 || medalCount === 0 ? 'medals' : 'medal';

const generateNegativePhrase = country => {
    const phrases = [
        `A mountain to climb for ${country.key} who only have ${country.currMedalsCount} ${pluraliseMedals(country.currMedalsCount)}.`,
        `Compared to Sochi, ${country.key} has ${-1 * country.diff} less ${pluraliseMedals(country.diff * -1)} so far.`,
        `Disappointingly, only ${country.currMedalsCount} ${pluraliseMedals(country.currMedalsCount)} so far in comparison to the ${country.prevMedalsCount} ${pluraliseMedals(country.prevMedalsCount)} in the last Olympics.`
    ];

    return phrases[Math.floor(Math.random() * phrases.length)];
}

const generatePositivePhrase = country => {
    const phrases = [
        `${country.key} is up ${country.diff} ${pluraliseMedals(country.diff)} compared to last time`,
        `On the rise, ${country.key} has ${country.diff} more ${pluraliseMedals(country.diff)} than 4 years ago`
    ];

    const doubled = `${country.key} has doubled the number of medals they had won so far in Sochi`;
    const moreThanDoubled = `${country.key} has more than doubled the number of medals they had won so far in Sochi`;

    if (country.currMedalsCount > 2 * country.prevMedalsCount) {
        phrases.push(moreThanDoubled);
    } else if (country.currMedalsCount === 2 * country.prevMedalsCount) {
        phrases.push(doubled);
    }

    return phrases[Math.floor(Math.random() * phrases.length)];
}


const topOverPerforming = sortedByPerformance.slice(0, 3)
topOverPerforming.map(country => country.phrase = generatePositivePhrase(country));

const topUnderPerforming = sortedByPerformance.slice(- 3)
topUnderPerforming.map(country => country.phrase = generateNegativePhrase(country));

console.log(topUnderPerforming)

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