import templateHTML from "./src/templates/main.html!text"
import headerHTML from "./src/templates/header.html!text"
import snapTemplate from './src/templates/snap_medals.html!text'

import medalTableJson from "../src/assets/data/medalsTable.json"
import medalListByDisciplineJson from "../src/assets/data/medalsList.json"
import countryPerformanceJson from "../src/assets/data/performance.json"
import nameLookup from '../src/lookups/name_lookup.json'
import rp from "request-promise"
import Mustache from "mustache"
import * as d3 from "d3"
import fs from "fs"
import _filter from 'lodash/filter'
import Logger from '../scripts/logger.js'
import config from '../config.json'

const maxDiff = d3.max(countryPerformanceJson, d => Math.abs(d.diff));

const scale = d3.scaleLinear().domain([0, maxDiff]).range([0, 50]);

const toTitleCase = (str, force) => {
    str = force ? str.toLowerCase() : str;
    return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
        (firstLetter) => firstLetter.toUpperCase()
    );
}

let season;

try {
    season = fs.readFileSync('./src/assets/data/season', 'utf-8')
} catch (err) {
    throw new Error('No season file detected. Please `npm run fetch` and then run this script again.')
}

if(process.isDeploy && config.path === '2018/02/winter-olympics-medals' && Number(season) === 2014) {
    throw new Error('You\'re loading 2014 data, but config.json would deploy to live. Stop!')
}

const countryPerformanceJsonToRender = countryPerformanceJson.map((country) => {
    // country.percentage = scale(Math.abs(country.diff));
    // country.margin = country.diff >= 0 ? 50 : 50 - country.percentage;
    // country.name = country.key;
    country.abbreviation = country.abbreviation.toLowerCase();
    // country.class = country.diff >= 0 ? "positive" : "negative";
    // country.diff = country.diff
    return country;
});

const relevantCountries = countryPerformanceJsonToRender.filter(country => country.diff !== 0);

const sortedByPerformance = relevantCountries.sort((a, b) => b.diff - a.diff);

const pluraliseMedals = medalCount => medalCount > 1 || medalCount === 0 ? 'medals' : 'medal';

const generateNegativePhrase = country => {
    const phrases = [
        `A mountain to climb for ${country.key}, who only have ${country.currMedalsCount} ${pluraliseMedals(country.currMedalsCount)}.`,
        `Compared to Sochi, ${country.key} has ${-1 * country.diff} less ${pluraliseMedals(country.diff * -1)} so far.`,
        `Disappointingly, only ${country.currMedalsCount} ${pluraliseMedals(country.currMedalsCount)} so far in comparison to the ${country.prevMedalsCount} ${pluraliseMedals(country.prevMedalsCount)} in the last Olympics.`
    ];

    return phrases[Math.floor(Math.random() * phrases.length)];
}

const generatePositivePhrase = country => {
    const phrases = [
        `Up ${country.diff} ${pluraliseMedals(country.diff)} compared to last time.`,
        `On the rise, ${country.key} has ${country.diff} more ${pluraliseMedals(country.diff)} than 4 years ago.`
    ];

    const doubled = `Have doubled the number of medals they had won so far in Sochi.`;
    const moreThanDoubled = `Have more than doubled the number of medals they had won so far in Sochi.`;

    if (country.currMedalsCount > 2 * country.prevMedalsCount) {
        phrases.push(moreThanDoubled);
    } else if (country.currMedalsCount === 2 * country.prevMedalsCount) {
        phrases.push(doubled);
    }

    return phrases[Math.floor(Math.random() * phrases.length)];
}


const topOverPerforming = sortedByPerformance.slice(0, 3)
const topUnderPerforming = sortedByPerformance.slice(- 3)
topOverPerforming.map(country => {
    country.phrase = generatePositivePhrase(country);
    country.arrow = 'up';
    return country;
});
topUnderPerforming.map(country => {
    country.phrase = generateNegativePhrase(country)
    country.arrow = 'down';
    return country;
});

const countriesByPerformance = [].concat.apply([], topOverPerforming.map((e, i) => [e, topUnderPerforming[i]]));

const mappedDisciplines = medalListByDisciplineJson.map(discip => {
        discip.lowerCaseAbbreviation = discip.abbreviation.toLowerCase();
        discip.firstName = discip.firstName ? `${toTitleCase(discip.firstName)}` : 'Team';
        discip.lastName = discip.lastName ? `${toTitleCase(discip.lastName)}` : `${discip.displayName}`;
        return discip
    }
).filter(entry => entry.abbreviation !== 'RUS'); // get rid of the damn Russians


const nestedMedalsByDiscipline = (d3.nest()
    .key(d => d.discipline.name)
    // .key(d => d.discipline.abbreviation)
    .key(d => d.olympicEvent.name)
    .rollup(leaves => {

        return {
            "gold": leaves.filter(d => d.medalWon === "gold"),
            "silver": leaves.filter(d => d.medalWon === "silver"),
            "bronze": leaves.filter(d => d.medalWon === "bronze"),
            "all": leaves
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
    )).map(d => {
        d.disciplineAbbreviation = d.values[0].value.all[0].discipline.abbreviation.toUpperCase()
        return d
    })

// fs.writeFileSync("./src/assets/data/test.json", JSON.stringify(nestedMedalsByDiscipline))

const score = country => country.medalCount.gold + country.medalCount.silver/100 + country.medalCount.bronze/10000

const rankReduce = (interm, cur, i, arr) => {

    if(interm.length === 0) { return [i] }

    const lastIndex = interm.slice(-1)[0]

    return score(cur) < score(arr[lastIndex]) ? interm.concat(i) : interm.concat(lastIndex)

}

const ranks = medalTableJson.reduce(rankReduce, []).map(i => i + 1)

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
            total: goldMedals.length //=== 0 ? '' : goldMedals.length
        },
        silverMedals: {
            list: silverMedals,
            total: silverMedals.length //=== 0 ? '' : silverMedals.length
        },
        bronzeMedals: {
            list: bronzeMedals,
            total: bronzeMedals.length //=== 0 ? '' : bronzeMedals.length
        },
        allMedals: {
            total: bronzeMedals.length + silverMedals.length + goldMedals.length
        },
        rank: country.medalCount.total === 0 ? '<span style="color: #00B2FF; opacity: 0.4;">●</span>' : ranks[i],
        noMedals : country.medalCount.total === 0,
        preferableName: nameLookup[country.olympicCountry.abbreviation],
        lowerCaseAbbreviation: country.olympicCountry.abbreviation.toLowerCase()
    });
});

export async function render() {
    const header = headerHTML;

    const snapHtml = Mustache.render(snapTemplate, {

        snapTable : medalTable.slice(0, 3)
            .map( o => {
                return {
                    rank : o.rank,
                    name : o.preferableName,
                    code : o.lowerCaseAbbreviation,
                    gold : o.medalCount.gold,
                    silver : o.medalCount.silver,
                    bronze : o.medalCount.bronze,
                    total : o.medalCount.total
                }
            })

    })

    fs.writeFileSync('./snap_medals.json', JSON.stringify({

        html : snapHtml,
        previous : '',
        refreshStatus : true,
        url : 'https://www.theguardian.com/sport/ng-interactive/2018/feb/09/winter-olympics-latest-medal-table-for-pyeongchang-2018',
        headline : '',
        trailText : ''

    }))

    const images = await rp({ uri: "https://interactive.guim.co.uk/docsdata/1rLKvNSIY8MAn0ZSM6aHcR2b3t_beRdPEu-EEavcGQHM.json", json: true});
    const headerCopy = await rp({ uri: "https://interactive.guim.co.uk/docsdata/15uAmR0zJkUXcR-6_EeAtFWQXtDojjdwSwGQoDmWvwkw.json", json: true });
    const headlineFirst = headerCopy.sheets.Sheet1[0].headline_first_row;
    const headlineSecond = headerCopy.sheets.Sheet1[0].headline_second_row;
    const standfirst = headerCopy.sheets.Sheet1[0].standfirst;

    const medalsWithUrls = nestedMedalsByDiscipline.map(discipline => {
        const matchAbbrev = images.sheets.Sheet1.find(item => item.abbreviation === discipline.disciplineAbbreviation);

        return matchAbbrev ? Object.assign({}, discipline, { url: matchAbbrev.url, captionLineOne: matchAbbrev.caption_line_1, captionLineTwo: matchAbbrev.caption_line_2 }) : discipline;
    })

    const renderHeader = Mustache.render(header, {
        "headlineFirst": headlineFirst,
        "headlineSecond": headlineSecond,
        "shareText": encodeURIComponent(headlineSecond),
        "standfirst": standfirst
    });

    const html = "<div class='page-wrapper'>" + renderHeader + Mustache.render(templateHTML, {
        // "otherCountries": medalTable.slice(6),
        "otherCountries": medalTable.slice(10),
        // "topCountries": medalTable.slice(0, 6),
        "topCountries": medalTable.slice(0, 10),
        "medalsByDiscipline": medalsWithUrls,
        "medalsComingThrough": medalsWithUrls.length > 0,
        "countriesByPeformance": countriesByPerformance
    }) + "</div>";

    Logger.setLastRender()
    return html
}
